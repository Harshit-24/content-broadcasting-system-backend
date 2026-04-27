import * as contentService from "../services/contentService.js";

const sendSuccess = (res, statusCode, message, data) => {
  res.status(statusCode).json({ success: true, message, data });
};

const sendError = (res, statusCode, message) => {
  res.status(statusCode).json({ success: false, message, data: null });
};

export const uploadContent = async (req, res) => {
  try {
    const {
      title,
      description,
      subject,
      start_time,
      end_time,
      rotation_duration,
    } = req.body;
    const file = req.file;

    if (!file) {
      return sendError(res, 400, "Please upload a file");
    }

    const content = await contentService.createContent(
      { title, description, subject, start_time, end_time, rotation_duration },
      { filename: file.filename, mimetype: file.mimetype, size: file.size },
      req.user.id,
    );

    sendSuccess(res, 201, "Content uploaded successfully", content);
  } catch (error) {
    sendError(res, 400, error.message);
  }
};

export const getMyUploads = async (req, res) => {
  try {
    const content = await contentService.getUserContent(req.user.id);
    sendSuccess(res, 200, "Content retrieved successfully", {
      count: content.length,
      content,
    });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

export const getPendingContent = async (req, res) => {
  try {
    const content = await contentService.getPendingContent();
    sendSuccess(res, 200, "Pending content retrieved successfully", {
      count: content.length,
      content,
    });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

export const approveContent = async (req, res) => {
  try {
    const content = await contentService.approveContent(
      req.params.id,
      req.user.id,
    );
    sendSuccess(res, 200, "Content approved successfully", content);
  } catch (error) {
    const statusCode = error.message === "Content not found" ? 404 : 400;
    sendError(res, statusCode, error.message);
  }
};

export const rejectContent = async (req, res) => {
  try {
    const content = await contentService.rejectContent(
      req.params.id,
      req.user.id,
      req.body.rejection_reason,
    );
    sendSuccess(res, 200, "Content rejected successfully", content);
  } catch (error) {
    const statusCode = error.message === "Content not found" ? 404 : 400;
    sendError(res, statusCode, error.message);
  }
};

export const getContentById = async (req, res) => {
  try {
    const content = await contentService.getContentById(req.params.id);

    // Teachers can only view their own content
    if (req.user.role === "teacher" && content.uploaded_by !== req.user.id) {
      return sendError(res, 403, "You are not authorized to view this content");
    }

    sendSuccess(res, 200, "Content retrieved successfully", content);
  } catch (error) {
    const statusCode = error.message === "Content not found" ? 404 : 500;
    sendError(res, statusCode, error.message);
  }
};

export const scheduleContent = async (req, res) => {
  try {
    const { start_time, end_time } = req.body;
    const content = await contentService.scheduleContent(
      req.params.id,
      start_time,
      end_time,
    );
    sendSuccess(res, 200, "Content scheduled successfully", content);
  } catch (error) {
    const statusCode = error.message === "Content not found" ? 404 : 400;
    sendError(res, statusCode, error.message);
  }
};

export const getScheduledContent = async (req, res) => {
  try {
    const content = await contentService.getScheduledContent();
    sendSuccess(res, 200, "Scheduled content retrieved successfully", {
      count: content.length,
      content,
    });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

export const getLiveContent = async (req, res) => {
  try {
    const content = await contentService.getLiveContent();
    sendSuccess(res, 200, "Live content retrieved successfully", {
      count: content.length,
      content,
    });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

export const getContentFeedBySubject = async (req, res) => {
  try {
    const { subject } = req.params;
    const content = await contentService.getContentFeedBySubject(subject);
    sendSuccess(
      res,
      200,
      `Content feed for subject '${subject}' retrieved successfully`,
      { subject, count: content.length, content },
    );
  } catch (error) {
    sendError(res, 400, error.message);
  }
};

export const getBroadcastReadyContent = async (req, res) => {
  try {
    const content = await contentService.getBroadcastReadyContent();
    sendSuccess(res, 200, "Broadcast-ready content retrieved successfully", {
      count: content.length,
      content,
    });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

export const getLiveContentByTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const content = await contentService.getLiveContentByTeacher(teacherId);
    sendSuccess(res, 200, "Live content for teacher retrieved successfully", {
      count: content.length,
      content: content.length > 0 ? content : null,
    });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};
