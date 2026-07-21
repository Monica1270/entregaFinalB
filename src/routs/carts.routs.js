import { Router } from "express";

const cartRouter = Router();

cartRouter.get("/", (req, res) => {
  res.json({ ok: true });
});

export default cartRouter;








