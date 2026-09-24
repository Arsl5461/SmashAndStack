class ApiResponse {
  static success(res, { statusCode = 200, message = 'Success', data = {}, meta } = {}) {
    const payload = {
      success: true,
      message,
      data,
    };

    if (meta) {
      payload.meta = meta;
    }

    return res.status(statusCode).json(payload);
  }

  static created(res, { message = 'Created successfully', data = {} } = {}) {
    return ApiResponse.success(res, { statusCode: 201, message, data });
  }

  static error(res, { statusCode = 500, message = 'Something went wrong', errors = [] } = {}) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
    });
  }
}

module.exports = ApiResponse;
