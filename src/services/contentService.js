import db from "../models/index.js";
import { parseAsIST } from "../utils/dateUtils.js";

const { Content, User, ContentSlot, ContentSchedule } = db;

// Reusable query includes
const USER_ATTRIBUTES = ["id", "name", "email", "role"];

const INCLUDE_UPLOADER = {
  model: User,
  as: "uploader",
  attributes: USER_ATTRIBUTES,
};

const INCLUDE_APPROVER = {
  model: User,
  as: "approver",
  attributes: USER_ATTRIBUTES,
};

const INCLUDE_SCHEDULES = {
  model: ContentSchedule,
  as: "schedules",
  include: [
    {
      model: ContentSlot,
      as: "slot",
      attributes: ["id", "subject"],
    },
  ],
};

const INCLUDE_BASIC = [INCLUDE_UPLOADER, INCLUDE_APPROVER];
const INCLUDE_FULL = [...INCLUDE_BASIC, INCLUDE_SCHEDULES];

// Calculate which content is currently broadcasting based on rotation cycle
const calculateCurrentlyBroadcasting = (contentItems, currentTime) => {
  if (!contentItems || contentItems.length === 0) return null;

  // Sort by rotation_order, then created_at
  const sortedItems = contentItems.sort((a, b) => {
    const orderA = a.schedules?.[0]?.rotation_order || 0;
    const orderB = b.schedules?.[0]?.rotation_order || 0;
    if (orderA !== orderB) return orderA - orderB;
    return new Date(a.created_at) - new Date(b.created_at);
  });

  // Calculate total cycle duration
  let totalCycleDuration = 0;
  const itemDurations = sortedItems.map((item) => {
    const duration = item.schedules?.[0]?.duration || 5;
    totalCycleDuration += duration;
    return duration;
  });

  if (totalCycleDuration === 0) return sortedItems[0];

  // Use earliest start_time as cycle reference point
  const earliestStart = sortedItems.reduce((earliest, item) => {
    const itemStart = new Date(item.start_time);
    return itemStart < earliest ? itemStart : earliest;
  }, new Date(sortedItems[0].start_time));

  // Calculate position in current cycle
  const elapsedMs = currentTime.getTime() - earliestStart.getTime();
  const elapsedMinutes = Math.floor(elapsedMs / 60000);
  const positionInCycle = elapsedMinutes % totalCycleDuration;

  // Find which item owns this position
  let cumulativeTime = 0;
  for (let i = 0; i < sortedItems.length; i++) {
    cumulativeTime += itemDurations[i];
    if (positionInCycle < cumulativeTime) {
      return sortedItems[i];
    }
  }

  return sortedItems[sortedItems.length - 1];
};

// Group content by subject and apply rotation logic
const applyRotationLogic = (contentList, currentTime) => {
  if (!contentList || contentList.length === 0) return [];

  // Group by subject
  const bySubject = {};
  contentList.forEach((content) => {
    const subject = content.subject;
    if (!bySubject[subject]) {
      bySubject[subject] = [];
    }
    bySubject[subject].push(content);
  });

  // Get currently broadcasting item for each subject
  const result = [];
  Object.keys(bySubject).forEach((subject) => {
    const currentItem = calculateCurrentlyBroadcasting(
      bySubject[subject],
      currentTime,
    );
    if (currentItem) {
      result.push(currentItem);
    }
  });

  return result;
};

export const createContent = async (contentData, fileData, uploadedBy) => {
  const {
    title,
    description,
    subject,
    start_time,
    end_time,
    rotation_duration,
  } = contentData;

  if (!title?.trim()) throw new Error("Title is required");
  if (!subject?.trim()) throw new Error("Subject is required");
  if (!start_time) throw new Error("Start time is required");
  if (!end_time) throw new Error("End time is required");
  if (!fileData) throw new Error("File is required");
  if (!fileData.filename || !fileData.mimetype || !fileData.size) {
    throw new Error("Invalid file data");
  }

  // Parse times as IST
  let start, end;
  try {
    start = parseAsIST(start_time);
  } catch {
    throw new Error("Invalid start time format");
  }

  try {
    end = parseAsIST(end_time);
  } catch {
    throw new Error("Invalid end time format");
  }

  if (end <= start) {
    throw new Error("End time must be after start time");
  }

  const durationMinutes = rotation_duration
    ? parseInt(rotation_duration, 10)
    : 5;

  if (isNaN(durationMinutes) || durationMinutes < 1) {
    throw new Error("Rotation duration must be a positive number");
  }

  const content = await Content.create({
    title: title.trim(),
    description: description?.trim() || null,
    subject: subject.trim(),
    file_path: `uploads/${fileData.filename}`,
    file_type: fileData.mimetype,
    file_size: fileData.size,
    uploaded_by: uploadedBy,
    status: "pending",
    start_time: start,
    end_time: end,
  });

  // Find or create slot for this subject
  let slot = await ContentSlot.findOne({ where: { subject: content.subject } });
  if (!slot) {
    slot = await ContentSlot.create({ subject: content.subject });
  }

  // Calculate next rotation order to avoid unique constraint violation
  const existingMaxOrder = await ContentSchedule.max("rotation_order", {
    where: { slot_id: slot.id },
  });
  const nextRotationOrder = existingMaxOrder ? existingMaxOrder + 1 : 1;

  await ContentSchedule.create({
    content_id: content.id,
    slot_id: slot.id,
    rotation_order: nextRotationOrder,
    duration: durationMinutes,
  });

  return Content.findByPk(content.id, { include: [INCLUDE_UPLOADER] });
};

export const getUserContent = async (userId) => {
  return Content.findAll({
    where: { uploaded_by: userId },
    include: INCLUDE_BASIC,
    order: [["created_at", "DESC"]],
  });
};

export const getContentById = async (contentId) => {
  const content = await Content.findByPk(contentId, {
    include: INCLUDE_BASIC,
  });

  if (!content) throw new Error("Content not found");
  return content;
};

export const getPendingContent = async () => {
  return Content.findAll({
    where: { status: "pending" },
    include: [INCLUDE_UPLOADER],
    order: [["created_at", "ASC"]],
  });
};

export const approveContent = async (contentId, principalId) => {
  const content = await Content.findByPk(contentId);
  if (!content) throw new Error("Content not found");

  if (content.status !== "pending") {
    throw new Error(
      `Cannot approve content with status '${content.status}'. Only pending content can be approved.`,
    );
  }

  content.status = "approved";
  content.approved_by = principalId;
  content.approved_at = new Date();
  content.rejection_reason = null;
  await content.save();

  return Content.findByPk(contentId, { include: INCLUDE_BASIC });
};

export const rejectContent = async (
  contentId,
  principalId,
  rejectionReason,
) => {
  if (!rejectionReason?.trim()) {
    throw new Error("Rejection reason is required");
  }

  const content = await Content.findByPk(contentId);
  if (!content) throw new Error("Content not found");

  if (content.status !== "pending") {
    throw new Error(
      `Cannot reject content with status '${content.status}'. Only pending content can be rejected.`,
    );
  }

  content.status = "rejected";
  content.rejection_reason = rejectionReason.trim();
  content.approved_by = principalId;
  content.approved_at = new Date();
  await content.save();

  return Content.findByPk(contentId, { include: INCLUDE_BASIC });
};

export const scheduleContent = async (contentId, startTime, endTime) => {
  if (!startTime || !endTime) {
    throw new Error("Start time and end time are required");
  }

  // Parse times as IST
  let start, end;
  try {
    start = parseAsIST(startTime);
  } catch {
    throw new Error("Invalid start time format");
  }

  try {
    end = parseAsIST(endTime);
  } catch {
    throw new Error("Invalid end time format");
  }

  if (end <= start) {
    throw new Error("End time must be after start time");
  }

  const content = await Content.findByPk(contentId);
  if (!content) throw new Error("Content not found");

  if (content.status !== "approved") {
    throw new Error(
      `Cannot schedule content with status '${content.status}'. Only approved content can be scheduled.`,
    );
  }

  const durationMinutes = Math.floor((end.getTime() - start.getTime()) / 60000);

  // Find or create slot
  let slot = await ContentSlot.findOne({ where: { subject: content.subject } });
  if (!slot) {
    slot = await ContentSlot.create({ subject: content.subject });
  }

  // Calculate next rotation order
  const existingMaxOrder = await ContentSchedule.max("rotation_order", {
    where: { slot_id: slot.id },
  });
  const nextRotationOrder = existingMaxOrder ? existingMaxOrder + 1 : 1;

  await ContentSchedule.create({
    content_id: contentId,
    slot_id: slot.id,
    rotation_order: nextRotationOrder,
    duration: durationMinutes,
  });

  content.start_time = start;
  content.end_time = end;
  await content.save();

  return Content.findByPk(contentId, { include: INCLUDE_FULL });
};

export const getScheduledContent = async () => {
  const { Op } = await import("sequelize");

  return Content.findAll({
    where: {
      status: "approved",
      start_time: { [Op.ne]: null },
      end_time: { [Op.ne]: null },
    },
    include: INCLUDE_FULL,
    order: [["start_time", "ASC"]],
  });
};

export const validateContentOwnership = async (contentId, userId) => {
  const content = await Content.findByPk(contentId);
  if (!content) throw new Error("Content not found");
  if (content.uploaded_by !== userId) {
    throw new Error("You are not authorized to access this content");
  }
  return true;
};

export const getLiveContent = async () => {
  const { Op } = await import("sequelize");
  const now = new Date();

  const allLiveContent = await Content.findAll({
    where: {
      status: "approved",
      start_time: { [Op.lte]: now },
      end_time: { [Op.gte]: now },
    },
    include: INCLUDE_FULL,
    order: [["end_time", "ASC"]],
  });

  // Apply rotation logic - returns one item per subject
  return applyRotationLogic(allLiveContent, now);
};

export const getLiveContentByTeacher = async (teacherId) => {
  const { Op } = await import("sequelize");
  const now = new Date();

  const allLiveContent = await Content.findAll({
    where: {
      status: "approved",
      uploaded_by: teacherId,
      start_time: { [Op.lte]: now },
      end_time: { [Op.gte]: now },
    },
    include: INCLUDE_FULL,
    order: [["end_time", "ASC"]],
  });

  return applyRotationLogic(allLiveContent, now);
};

export const getContentFeedBySubject = async (subject) => {
  const { Op } = await import("sequelize");

  if (!subject?.trim()) throw new Error("Subject is required");

  const now = new Date();

  const allLiveContent = await Content.findAll({
    where: {
      status: "approved",
      subject: subject.trim(),
      start_time: { [Op.lte]: now },
      end_time: { [Op.gte]: now },
    },
    include: INCLUDE_FULL,
    order: [["start_time", "ASC"]],
  });

  return applyRotationLogic(allLiveContent, now);
};

export const getBroadcastReadyContent = async () => {
  const { Op } = await import("sequelize");

  return Content.findAll({
    where: {
      status: "approved",
      start_time: { [Op.ne]: null },
      end_time: { [Op.ne]: null },
    },
    include: INCLUDE_FULL,
    order: [["start_time", "ASC"]],
  });
};
