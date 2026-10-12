
const http = require("http");
const fs = require("fs");
const path = require("path");

const SUPABASE_URL = "https://kkuwqdluicotbzgdmfjk.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_Cs1-1HixNDSvTVVJyfp32Q_o1e94vZn";


const PORT = Number(process.env.PORT) || 3000;

const PROJECT_DIR = path.resolve(__dirname, "..");
const FRONTEND_DIR = path.join(PROJECT_DIR, "Front-End");

const TABLES = {
  pelanggan: {
    primaryKey: "id_pelanggan",
    fields: [
      "nama_pelanggan",
      "no_telepon",
      "email",
      "alamat"
    ]
  },

  paket: {
    table: "paket_wedding",
    primaryKey: "id_paket",
    fields: [
      "nama_paket",
      "harga",
      "deskripsi"
    ]
  },

  transaksi: {
    table: "transaksi_wedding",
    primaryKey: "id_transaksi",
    fields: [
      "id_pelanggan",
      "id_paket",
      "tanggal_transaksi",
      "tanggal_acara",
      "total_transaksi",
      "status"
    ]
  },

  pembayaran: {
    primaryKey: "id_pembayaran",
    fields: [
      "id_transaksi",
      "tanggal_pembayaran",
      "jumlah_bayar",
      "metode_pembayaran",
      "keterangan"
    ]
  }
};

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods":
      "GET, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization"
  });

  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    let size = 0;
    const maxSize = 1024 * 1024;

    req.on("data", chunk => {
      size += chunk.length;

      if (size > maxSize) {
        reject(new Error("Ukuran data terlalu besar."));
        req.destroy();
        return;
      }

      body += chunk;
    });

    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("Format JSON tidak valid."));
      }
    });

    req.on("error", reject);
  });
}

function getTableConfig(resource) {
  const config = TABLES[resource];

  if (!config) {
    return null;
  }

  return {
    ...config,
    table: config.table || resource
  };
}

async function supabaseRequest(
  table,
  method = "GET",
  query = "",
  body = null
) {
  const url =
    `${SUPABASE_URL}/rest/v1/${table}` +
    (query ? `?${query}` : "");

 
const headers = {
  apikey: SUPABASE_PUBLISHABLE_KEY,
  Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
  Accept: "application/json"
};

if (body !== null) {
  headers["Content-Type"] = "application/json";
}

if (method === "PATCH") {
  headers.Prefer = "return=representation";
}

console.log("Supabase URL:", url);
console.log("Metode request:", method);

  const response = await fetch(url, {
    method,
    headers,
    body: body === null ? undefined : JSON.stringify(body)
  });

console.log("Supabase HTTP status:", response.status);
console.log("Supabase response headers:", response.headers.get("content-type"));

  const responseText = await response.text();
  if (
  table === "transaksi_wedding" ||
  table === "pembayaran"
) {
  console.log(`Isi respons ${table}:`, responseText);
}

  let result = null;

  if (responseText) {
    try {
      result = JSON.parse(responseText);
    } catch {
      result = { message: responseText };
    }
  }

  if (!response.ok) {
    console.log("Detail error Supabase:", responseText);
    const error = new Error(
      result?.message ||
      result?.hint ||
      `Supabase mengembalikan HTTP ${response.status}.`
    );

    error.statusCode = response.status;
    error.details = result;

    throw error;
  }

  return result;
}

function validateData(resource, data, isUpdate = false) {
  if (!data || typeof data !== "object" ||
      Array.isArray(data)) {
    return "Data harus berbentuk objek JSON.";
  }

  const config = getTableConfig(resource);

  if (!config) {
    return "Jenis data tidak ditemukan.";
  }

  const allowedFields = config.fields;
  const submittedFields = Object.keys(data);

  if (submittedFields.length === 0) {
    return "Data tidak boleh kosong.";
  }

  const invalidField = submittedFields.find(
    field => !allowedFields.includes(field)
  );

  if (invalidField) {
    return `Kolom ${invalidField} tidak diizinkan.`;
  }

  if (!isUpdate) {
    if (resource === "pelanggan" &&
        !String(data.nama_pelanggan || "").trim()) {
      return "Nama pelanggan wajib diisi.";
    }

    if (resource === "paket" &&
        !String(data.nama_paket || "").trim()) {
      return "Nama paket wajib diisi.";
    }

    if (resource === "transaksi" &&
        (!data.id_pelanggan || !data.id_paket)) {
      return "Pelanggan dan paket wedding wajib dipilih.";
    }

    if (resource === "pembayaran" &&
        (!data.id_transaksi || !data.tanggal_pembayaran)) {
      return "Transaksi dan tanggal pembayaran wajib diisi.";
    }
  }

  if (resource === "paket" &&
      data.harga !== undefined &&
      (!Number.isFinite(Number(data.harga)) ||
       Number(data.harga) < 0)) {
    return "Harga paket harus berupa angka nonnegatif.";
  }

  if (resource === "transaksi" &&
      data.total_transaksi !== undefined &&
      (!Number.isFinite(Number(data.total_transaksi)) ||
       Number(data.total_transaksi) < 0)) {
    return "Total transaksi harus berupa angka nonnegatif.";
  }

  if (resource === "pembayaran" &&
      data.jumlah_bayar !== undefined &&
      (!Number.isFinite(Number(data.jumlah_bayar)) ||
       Number(data.jumlah_bayar) <= 0)) {
    return "Jumlah pembayaran harus lebih besar dari nol.";
  }

  return null;
}

async function getSummary() {
  const [transaksi, pembayaran, pelanggan, paket] =
    await Promise.all([
      supabaseRequest(
        "transaksi_wedding",
        "GET",
        "select=id_transaksi,total_transaksi,status"
      ),
      supabaseRequest(
        "pembayaran",
        "GET",
        "select=id_transaksi,jumlah_bayar"
      ),
      supabaseRequest(
        "pelanggan",
        "GET",
        "select=id_pelanggan"
      ),
      supabaseRequest(
        "paket_wedding",
        "GET",
        "select=id_paket"
      )
    ]);

  const paidByTransaction = {};

  for (const item of pembayaran || []) {
    const id = item.id_transaksi;

    paidByTransaction[id] =
      (paidByTransaction[id] || 0) +
      Number(item.jumlah_bayar || 0);
  }

  let totalPendapatan = 0;
  let totalPiutang = 0;
  let totalTransaksi = 0;

  for (const item of transaksi || []) {
    const total = Number(item.total_transaksi || 0);
    const dibayar =
      paidByTransaction[item.id_transaksi] || 0;

    totalPendapatan += Math.min(total, dibayar);
    totalPiutang += Math.max(0, total - dibayar);
    totalTransaksi += 1;
  }

  return {
    totalPendapatan,
    totalPiutang,
    totalTransaksi,
    totalPelanggan: (pelanggan || []).length,
    totalPaket: (paket || []).length
  };
}

async function handleAPI(req, res, url) {
  const parts = url.pathname.split("/").filter(Boolean);
  const resource = parts[1];
  const id = parts[2];

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods":
        "GET, POST, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization"
    });

    res.end();
    return;
  }

  if (url.pathname === "/api/health" &&
      req.method === "GET") {
    sendJSON(res, 200, {
      success: true,
      message: "Backend Lunelle Wedding aktif."
    });
    return;
  }

  if (url.pathname === "/api/dashboard" &&
      req.method === "GET") {
    const summary = await getSummary();

    sendJSON(res, 200, {
      success: true,
      data: summary
    });
    return;
  }

  const config = getTableConfig(resource);

  if (!config) {
    sendJSON(res, 404, {
      success: false,
      message: "Endpoint API tidak ditemukan."
    });
    return;
  }

  if (req.method === "GET" && !id) {
    const result = await supabaseRequest(
      config.table,
      "GET",
      "select=*"
    );

    sendJSON(res, 200, {
      success: true,
      data: result
    });
    return;
  }

  if (req.method === "POST" && !id) {
    const data = await readBody(req);
    const error = validateData(resource, data);

    if (error) {
      sendJSON(res, 400, {
        success: false,
        message: error
      });
      return;
    }

    const result = await supabaseRequest(
      config.table,
      "POST",
      "",
      data
    );

    sendJSON(res, 201, {
      success: true,
      message: "Data berhasil ditambahkan.",
      data: result
    });
    return;
  }

  if (req.method === "PATCH" && id) {
    const data = await readBody(req);
    const error = validateData(resource, data, true);

    if (error) {
      sendJSON(res, 400, {
        success: false,
        message: error
      });
      return;
    }

    const query =
      `${config.primaryKey}=eq.${encodeURIComponent(id)}`;

    const result = await supabaseRequest(
  config.table,
  "PATCH",
  query,
  data
);

console.log("ID pelanggan yang diedit:", id);
console.log("Data yang dikirim:", data);
console.log("Hasil update Supabase:", result);

    sendJSON(res, 200, {
      success: true,
      message: "Data berhasil diperbarui.",
      data: result
    });
    return;
  }

  if (req.method === "DELETE" && id) {
    const query =
      `${config.primaryKey}=eq.${encodeURIComponent(id)}`;

    const result = await supabaseRequest(
      config.table,
      "DELETE",
      query
    );

    sendJSON(res, 200, {
      success: true,
      message: "Permintaan penghapusan data selesai.",
      data: result
    });
    return;
  }

  sendJSON(res, 405, {
    success: false,
    message: "Metode HTTP tidak didukung."
  });
}

function serveFrontend(req, res, url) {
  let requestedPath = decodeURIComponent(url.pathname);

  if (requestedPath === "/") {
    requestedPath = "/HTML/index.html";
  } else if (requestedPath.startsWith("/CSS/")) {
    requestedPath = requestedPath.replace("/CSS/", "/CSS/");
  } else if (requestedPath.startsWith("/JS/")) {
    requestedPath = requestedPath.replace("/JS/", "/JS/");
  }

  const filePath = path.resolve(
    FRONTEND_DIR,
    "." + requestedPath
  );

  if (
    filePath !== FRONTEND_DIR &&
    !filePath.startsWith(FRONTEND_DIR + path.sep)
  ) {
    res.writeHead(403);
    res.end("Akses ditolak.");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(404, {
        "Content-Type": "text/plain; charset=utf-8"
      });
      res.end(
        "File tidak ditemukan. Periksa folder Front-End."
      );
      return;
    }

    const contentType =
      MIME_TYPES[path.extname(filePath).toLowerCase()] ||
      "application/octet-stream";

    res.writeHead(200, {
      "Content-Type": contentType
    });

    res.end(content);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(
    req.url,
    `http://${req.headers.host || "localhost"}`
  );

  if (url.pathname.startsWith("/api/")) {
    if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
      sendJSON(res, 500, {
        success: false,
        message:
          "Konfigurasi Supabase belum tersedia. " +
          "Atur SUPABASE_URL dan " +
          "SUPABASE_PUBLISHABLE_KEY."
      });
      return;
    }

    try {
      await handleAPI(req, res, url);
    } catch (error) {
      console.error("API error:", error.message);

      sendJSON(
        res,
        error.statusCode || 500,
        {
          success: false,
          message: error.message || "Terjadi kesalahan server."
        }
      );
    }

    return;
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405);
    res.end("Metode tidak didukung.");
    return;
  }

  serveFrontend(req, res, url);
});

server.listen(PORT, () => {
  console.log("----------------------------------");
  console.log("   LUNELLE WEDDING BACKEND");
  console.log("----------------------------------");
  console.log(`Server aktif: http://localhost:${PORT}`);
  console.log(`API kesehatan: http://localhost:${PORT}/api/health`);
  console.log(`Dashboard API: http://localhost:${PORT}/api/dashboard`);
  console.log("----------------------------------");
});
