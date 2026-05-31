class BaseProvider {
  canHandle(intentFlags) {
    return false;
  }

  async getContext(message, intentFlags) {
    return null;
  }
}

module.exports = BaseProvider;
