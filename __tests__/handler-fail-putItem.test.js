jest.mock("aws-sdk", () => {
  return {
    config: {
      update() {
        return {};
      },
    },
    DynamoDB: jest.fn(() => {
      return {
        putItem: jest.fn().mockImplementation(() => {
          throw new Error();
        }),
      };
    }),
    S3: jest.fn(() => {
      return {
        upload: jest.fn().mockImplementation(() => ({
          promise: jest.fn().mockReturnValue(Promise.resolve(false)),
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
    expect(
      handler.uploadCsvToS3Handler({
        jobId: "test-job-id",
      })
    ).rejects.toThrow(new Error("Error in backend: Error"));
  });
});
