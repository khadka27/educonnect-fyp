import {
  createMockRequestResponse,
  prisma,
  cleanupDatabase,
  mockSession,
} from "../helpers/testHelper";
import {
  getHandler,
  postHandler,
  putHandler,
  deleteHandler,
} from "@/app/api/comments/route";
import { getServerSession } from "next-auth";

jest.mock("next-auth");
jest.mock("@prisma/client");

describe("Comments API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getServerSession.mockResolvedValue(mockSession);
  });

  afterAll(async () => {
    await cleanupDatabase();
    await prisma.$disconnect();
  });

  describe("GET /api/comments", () => {
    it("should return comments for an article", async () => {
      const mockComments = [
        {
          id: "1",
          content: "Test Comment 1",
          authorId: "user-1",
          articleId: "article-1",
          createdAt: new Date(),
        },
        {
          id: "2",
          content: "Test Comment 2",
          authorId: "user-2",
          articleId: "article-1",
          createdAt: new Date(),
        },
      ];

      prisma.comment.findMany.mockResolvedValue(mockComments);

      const { req, res } = createMockRequestResponse("GET", null, {
        articleId: "article-1",
      });

      await getHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(mockComments);
    });

    it("should return 400 if articleId is missing", async () => {
      const { req, res } = createMockRequestResponse("GET");

      await getHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: "Article ID is required",
      });
    });

    it("should handle server errors gracefully", async () => {
      prisma.comment.findMany.mockRejectedValue(new Error("Database error"));

      const { req, res } = createMockRequestResponse("GET", null, {
        articleId: "article-1",
      });

      await getHandler(req, res);

      expect(res._getStatusCode()).toBe(500);
      expect(JSON.parse(res._getData())).toEqual({
        error: "Internal server error",
      });
    });
  });

  describe("POST /api/comments", () => {
    it("should create a new comment", async () => {
      const mockComment = {
        id: "1",
        content: "New Comment",
        authorId: mockSession.user.id,
        articleId: "article-1",
        createdAt: new Date(),
      };

      prisma.comment.create.mockResolvedValue(mockComment);

      const { req, res } = createMockRequestResponse("POST", {
        content: "New Comment",
        articleId: "article-1",
      });

      await postHandler(req, res);

      expect(res._getStatusCode()).toBe(201);
      expect(JSON.parse(res._getData())).toEqual(mockComment);
    });

    it("should return 400 if required fields are missing", async () => {
      const { req, res } = createMockRequestResponse("POST", {
        // Missing content and articleId
      });

      await postHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: "Content and article ID are required",
      });
    });

    it("should return 401 if user is not authenticated", async () => {
      getServerSession.mockResolvedValue(null);

      const { req, res } = createMockRequestResponse("POST", {
        content: "New Comment",
        articleId: "article-1",
      });

      await postHandler(req, res);

      expect(res._getStatusCode()).toBe(401);
      expect(JSON.parse(res._getData())).toEqual({
        error: "Unauthorized",
      });
    });
  });

  describe("PUT /api/comments", () => {
    it("should update a comment", async () => {
      const mockComment = {
        id: "1",
        content: "Updated Comment",
        authorId: mockSession.user.id,
        articleId: "article-1",
      };

      prisma.comment.findUnique.mockResolvedValue(mockComment);
      prisma.comment.update.mockResolvedValue(mockComment);

      const { req, res } = createMockRequestResponse("PUT", {
        id: "1",
        content: "Updated Comment",
      });

      await putHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(mockComment);
    });

    it("should return 404 if comment does not exist", async () => {
      prisma.comment.findUnique.mockResolvedValue(null);

      const { req, res } = createMockRequestResponse("PUT", {
        id: "non-existent",
        content: "Updated Comment",
      });

      await putHandler(req, res);

      expect(res._getStatusCode()).toBe(404);
      expect(JSON.parse(res._getData())).toEqual({
        error: "Comment not found",
      });
    });

    it("should return 403 if user is not the author", async () => {
      const mockComment = {
        id: "1",
        content: "Original Comment",
        authorId: "different-user-id",
        articleId: "article-1",
      };

      prisma.comment.findUnique.mockResolvedValue(mockComment);

      const { req, res } = createMockRequestResponse("PUT", {
        id: "1",
        content: "Updated Comment",
      });

      await putHandler(req, res);

      expect(res._getStatusCode()).toBe(403);
      expect(JSON.parse(res._getData())).toEqual({
        error: "Forbidden",
      });
    });
  });

  describe("DELETE /api/comments", () => {
    it("should delete a comment", async () => {
      const mockComment = {
        id: "1",
        authorId: mockSession.user.id,
      };

      prisma.comment.findUnique.mockResolvedValue(mockComment);
      prisma.comment.delete.mockResolvedValue(mockComment);

      const { req, res } = createMockRequestResponse("DELETE", null, {
        id: "1",
      });

      await deleteHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({
        message: "Comment deleted successfully",
      });
    });

    it("should return 404 if comment does not exist", async () => {
      prisma.comment.findUnique.mockResolvedValue(null);

      const { req, res } = createMockRequestResponse("DELETE", null, {
        id: "non-existent",
      });

      await deleteHandler(req, res);

      expect(res._getStatusCode()).toBe(404);
      expect(JSON.parse(res._getData())).toEqual({
        error: "Comment not found",
      });
    });

    it("should return 403 if user is not the author", async () => {
      const mockComment = {
        id: "1",
        authorId: "different-user-id",
      };

      prisma.comment.findUnique.mockResolvedValue(mockComment);

      const { req, res } = createMockRequestResponse("DELETE", null, {
        id: "1",
      });

      await deleteHandler(req, res);

      expect(res._getStatusCode()).toBe(403);
      expect(JSON.parse(res._getData())).toEqual({
        error: "Forbidden",
      });
    });
  });
});
