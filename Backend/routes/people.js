import express from "express";
import { getPeople } from "../controllers/peopleController.js";

const router = express.Router();

router.get("/", getPeople);

export default router;