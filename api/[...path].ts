import worker from "../src/backend/worker.js";

export default async function handler(req: any, res: any) {
  try {
    const protocol = (req.headers["x-forwarded-proto"] as string) || "https";
    const host =
      (req.headers["x-forwarded-host"] as string) ||
      (req.headers.host as string) ||
      "localhost";
    const url = `${protocol}://${host}${req.url || "/"}`;

    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((v) => headers.append(key, String(v)));
        } else {
          headers.set(key, String(value));
        }
      }
    }

    let body: Buffer | undefined;
    if (req.method !== "GET" && req.method !== "HEAD") {
      if (req.body) {
        body = typeof req.body === "string"
          ? Buffer.from(req.body)
          : Buffer.from(JSON.stringify(req.body));
      }
    }

    const webReq = new Request(url, {
      method: req.method,
      headers,
      body: body ? (body as any) : undefined,
      // @ts-ignore
      duplex: "half",
    });

    const response = await worker.fetch(
      webReq,
      {} as any,
      {
        waitUntil: () => {},
        passThroughOnException: () => {},
      } as any
    );

    res.status(response.status);
    response.headers.forEach((value: string, key: string) => {
      res.setHeader(key, value);
    });

    const arrayBuffer = await response.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (error: any) {
    console.error("[Vercel Function] Error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
