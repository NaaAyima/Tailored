import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { prisma } from "../prisma";
import { auth } from "../auth";
import type { Context } from "hono";

type AppVariables = {
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
};

const customersRouter = new Hono<AppVariables>();

const garmentTypes = ["blouse", "pants", "dress", "shirt", "skirt", "suit", "other"] as const;
type GarmentType = (typeof garmentTypes)[number];

const garmentStatuses = ["pending", "in_progress", "completed"] as const;

const createCustomerSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  notes: z.string().optional(),
  chest: z.number().positive().optional(),
  waist: z.number().positive().optional(),
  hips: z.number().positive().optional(),
  shoulder: z.number().positive().optional(),
  inseam: z.number().positive().optional(),
  neckSize: z.number().positive().optional(),
  sleeveLength: z.number().positive().optional(),
});

const updateCustomerSchema = createCustomerSchema.partial();

const createGarmentSchema = z.object({
  type: z.enum(garmentTypes),
  description: z.string().optional(),
  status: z.enum(garmentStatuses).optional(),
});

function buildGarmentCounts(garments: Array<{ type: string }>): Record<GarmentType | "total", number> {
  const counts: Record<GarmentType | "total", number> = {
    blouse: 0,
    pants: 0,
    dress: 0,
    shirt: 0,
    skirt: 0,
    suit: 0,
    other: 0,
    total: 0,
  };

  for (const garment of garments) {
    const type = garment.type as GarmentType;
    if (type in counts) {
      counts[type] += 1;
    } else {
      counts.other += 1;
    }
    counts.total += 1;
  }

  return counts;
}

// GET / - list all customers for the authenticated user
customersRouter.get("/", async (c: Context<AppVariables>) => {
  const session = c.get("session");
  if (!session) {
    return c.json({ error: { message: "Unauthorized", code: "UNAUTHORIZED" } }, 401);
  }

  const customers = await prisma.customer.findMany({
    where: { userId: session.userId },
    include: { garments: true },
    orderBy: { createdAt: "desc" },
  });

  const customersWithCounts = customers.map((customer) => {
    const { garments, ...rest } = customer;
    return {
      ...rest,
      garmentCounts: buildGarmentCounts(garments),
    };
  });

  return c.json({ data: customersWithCounts });
});

// POST / - create a customer
customersRouter.post("/", zValidator("json", createCustomerSchema), async (c: Context<AppVariables>) => {
  const session = c.get("session");
  if (!session) {
    return c.json({ error: { message: "Unauthorized", code: "UNAUTHORIZED" } }, 401);
  }

  const body = c.req.valid("json" as never) as z.infer<typeof createCustomerSchema>;

  const customer = await prisma.customer.create({
    data: {
      userId: session.userId,
      ...body,
    },
  });

  return c.json({ data: customer }, 201);
});

// GET /:id - get a single customer with their garments
customersRouter.get("/:id", async (c: Context<AppVariables>) => {
  const session = c.get("session");
  if (!session) {
    return c.json({ error: { message: "Unauthorized", code: "UNAUTHORIZED" } }, 401);
  }

  const id = c.req.param("id");

  const customer = await prisma.customer.findFirst({
    where: { id, userId: session.userId },
    include: { garments: { orderBy: { createdAt: "desc" } } },
  });

  if (!customer) {
    return c.json({ error: { message: "Customer not found", code: "NOT_FOUND" } }, 404);
  }

  return c.json({ data: customer });
});

// PUT /:id - update a customer
customersRouter.put("/:id", zValidator("json", updateCustomerSchema), async (c: Context<AppVariables>) => {
  const session = c.get("session");
  if (!session) {
    return c.json({ error: { message: "Unauthorized", code: "UNAUTHORIZED" } }, 401);
  }

  const id = c.req.param("id");
  const body = c.req.valid("json" as never) as z.infer<typeof updateCustomerSchema>;

  const existing = await prisma.customer.findFirst({
    where: { id, userId: session.userId },
  });

  if (!existing) {
    return c.json({ error: { message: "Customer not found", code: "NOT_FOUND" } }, 404);
  }

  const updated = await prisma.customer.update({
    where: { id },
    data: body,
  });

  return c.json({ data: updated });
});

// DELETE /:id - delete a customer
customersRouter.delete("/:id", async (c: Context<AppVariables>) => {
  const session = c.get("session");
  if (!session) {
    return c.json({ error: { message: "Unauthorized", code: "UNAUTHORIZED" } }, 401);
  }

  const id = c.req.param("id");

  const existing = await prisma.customer.findFirst({
    where: { id, userId: session.userId },
  });

  if (!existing) {
    return c.json({ error: { message: "Customer not found", code: "NOT_FOUND" } }, 404);
  }

  await prisma.customer.delete({ where: { id } });

  return c.body(null, 204);
});

// POST /:id/garments - add a garment to a customer
customersRouter.post("/:id/garments", zValidator("json", createGarmentSchema), async (c: Context<AppVariables>) => {
  const session = c.get("session");
  if (!session) {
    return c.json({ error: { message: "Unauthorized", code: "UNAUTHORIZED" } }, 401);
  }

  const id = c.req.param("id");
  const body = c.req.valid("json" as never) as z.infer<typeof createGarmentSchema>;

  const customer = await prisma.customer.findFirst({
    where: { id, userId: session.userId },
  });

  if (!customer) {
    return c.json({ error: { message: "Customer not found", code: "NOT_FOUND" } }, 404);
  }

  const garment = await prisma.customerGarment.create({
    data: {
      customerId: id,
      type: body.type,
      description: body.description,
      status: body.status ?? "pending",
    },
  });

  return c.json({ data: garment }, 201);
});

// DELETE /:id/garments/:garmentId - remove a garment
customersRouter.delete("/:id/garments/:garmentId", async (c: Context<AppVariables>) => {
  const session = c.get("session");
  if (!session) {
    return c.json({ error: { message: "Unauthorized", code: "UNAUTHORIZED" } }, 401);
  }

  const id = c.req.param("id");
  const garmentId = c.req.param("garmentId");

  const customer = await prisma.customer.findFirst({
    where: { id, userId: session.userId },
  });

  if (!customer) {
    return c.json({ error: { message: "Customer not found", code: "NOT_FOUND" } }, 404);
  }

  const garment = await prisma.customerGarment.findFirst({
    where: { id: garmentId, customerId: id },
  });

  if (!garment) {
    return c.json({ error: { message: "Garment not found", code: "NOT_FOUND" } }, 404);
  }

  await prisma.customerGarment.delete({ where: { id: garmentId } });

  return c.body(null, 204);
});

export { customersRouter };
