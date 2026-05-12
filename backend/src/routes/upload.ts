import { FastifyPluginAsync } from "fastify";
import { uploadBuffer } from "../services/ipfs.service.js";

const uploadRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post(
    "/image",
    { preHandler: [fastify.authenticate] },
    async (req, reply) => {
      const data = await req.file();
      if (!data) return reply.status(400).send({ error: "No file uploaded" });

      const buffer = await data.toBuffer();
      const cid = await uploadBuffer(buffer, data.filename);

      return { cid };
    }
  );
};

export default uploadRoutes;
