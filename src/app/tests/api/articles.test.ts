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
} from "@/app/api/articles/route";
import { getServerSession } from "next-auth";

jest.mock("next-auth");
jest.mock("@prisma/client");

describe("Articles API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
  });

  afterAll(async () => {
    await cleanupDatabase();
    await prisma.$disconnect();
  });

  describe("GET /api/articles", () => {
    it("should return all articles", async () => {
      const mockArticles = [
        {
          id: "1",
          title: "Test Article 1",
          content: "Content 1",
          authorId: "user-1",
          createdAt: new Date(),
        },
        {
          id: "2",
          title: "Test Article 2",
          content: "Content 2",
          authorId: "user-2",
          createdAt: new Date(),
        },
      ];

      (prisma.article.findMany as jest.Mock).mockResolvedValue(mockArticles);

      const { req, res } = createMockRequestResponse("GET");

      await getHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(mockArticles);
    });

    it("should handle server errors gracefully", async () => {
      (prisma.article.findMany as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const { req, res } = createMockRequestResponse("GET");

      await getHandler(req, res);

      expect(res._getStatusCode()).toBe(500);
      expect(JSON.parse(res._getData())).toEqual({
        error: "Internal server error",
      });
    });
  });

  describe("POST /api/articles", () => {
    it("should create a new article", async () => {
      const mockArticle = {
        id: "1",
        title: "New Article",
        content: "Content",
        authorId: mockSession.user.id,
        createdAt: new Date(),
      };

      (prisma.article.create as jest.Mock).mockResolvedValue(mockArticle);

      const { req, res } = createMockRequestResponse("POST", {
        title: "New Article",
        content: "Content",
      });

      await postHandler(req, res);

      expect(res._getStatusCode()).toBe(201);
      expect(JSON.parse(res._getData())).toEqual(mockArticle);
    });

    it("should return 400 if required fields are missing", async () => {
      const { req, res } = createMockRequestResponse("POST", {
        // Missing title and content
      });

      await postHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: "Missing required fields",
      });
    });

    it("should return 401 if user is not authenticated", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const { req, res } = createMockRequestResponse("POST", {
        title: "New Article",
        content: "Content",
      });

      await postHandler(req, res);

      expect(res._getStatusCode()).toBe(401);
      expect(JSON.parse(res._getData())).toEqual({
        error: "Unauthorized",
      });
    });
  });

  describe("PUT /api/articles", () => {
    it("should update an article", async () => {
      const mockArticle = {
        id: "1",
        title: "Updated Article",
        content: "Updated Content",
        authorId: mockSession.user.id,
      };

      (prisma.article.findUnique as jest.Mock).mockResolvedValue(mockArticle);
      (prisma.article.update as jest.Mock).mockResolvedValue(mockArticle);

      const { req, res } = createMockRequestResponse("PUT", {
        id: "1",
        title: "Updated Article",
        content: "Updated Content",
      });

      await putHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(mockArticle);
    });

    it("should return 404 if article does not exist", async () => {
      (prisma.article.findUnique as jest.Mock).mockResolvedValue(null);

      const { req, res } = createMockRequestResponse("PUT", {
        id: "non-existent",
        title: "Updated Article",
        content: "Updated Content",
      });

      await putHandler(req, res);

      expect(res._getStatusCode()).toBe(404);
      expect(JSON.parse(res._getData())).toEqual({
        error: "Article not found",
      });
    });
  });

  describe("DELETE /api/articles", () => {
    it("should delete an article", async () => {
      const mockArticle = {
        id: "1",
        authorId: mockSession.user.id,
      };

      (prisma.article.findUnique as jest.Mock).mockResolvedValue(mockArticle);
      (prisma.article.delete as jest.Mock).mockResolvedValue(mockArticle);

      const { req, res } = createMockRequestResponse("DELETE", null, {
        id: "1",
      });

      await deleteHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({
        message: "Article deleted successfully",
      });
    });

    it("should return 404 if article does not exist", async () => {
      (prisma.article.findUnique as jest.Mock).mockResolvedValue(null);

      const { req, res } = createMockRequestResponse("DELETE", null, {
        id: "non-existent",
      });

      await deleteHandler(req, res);

      expect(res._getStatusCode()).toBe(404);
      expect(JSON.parse(res._getData())).toEqual({
        error: "Article not found",
      });
    });

    it("should return 403 if user is not the author", async () => {
      const mockArticle = {
        id: "1",
        authorId: "different-user-id",
      };

      (prisma.article.findUnique as jest.Mock).mockResolvedValue(mockArticle);

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
