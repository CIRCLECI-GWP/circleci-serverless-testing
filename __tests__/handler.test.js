jest.mock("aws-sdk", () => {
  return {
    config: {
      update() {
        return {};
      },
    },
    DynamoDB: jest.fn(() => {
      return {
        putItem: jest.fn().mockImplementation(() => ({
          promise: jest.fn().mockReturnValue(Promise.resolve(true)),
        })),
      };
    }),
    S3: jest.fn(() => {
      return {
        upload: jest.fn().mockImplementation(() => ({
          promise: jest.fn().mockReturnValue(Promise.resolve(true)),
        })),
      };
    }),
  };
});

const handler = require("../handler");

describe("uploadCsvToS3Handler", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  test("test uploadFile", async () => {
    const response = await handler.uploadCsvToS3Handler({
      jobId: "test-job-id",
    });

    let body = JSON.parse(response.body);

    expect(body.status).toBe("success");
    expect(body.jobId).toBe("test-job-id");
  });
});
