import tls from "node:tls";

interface SmtpEmailOptions {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  text?: string;
}

export function sendGmailSmtp({
  to,
  toName,
  subject,
  html,
  text,
}: SmtpEmailOptions): Promise<{ success: boolean; messageId: string }> {
  return new Promise((resolve, reject) => {
    const user = process.env.GMAIL_USER || "aburayhan.bpi@gmail.com";
    const pass = process.env.GMAIL_APP_PASSWORD || "vjhtomdgtlqipvsd";

    if (!user || !pass) {
      return reject(new Error("GMAIL_USER or GMAIL_APP_PASSWORD is missing in environment variables."));
    }

    const socket = tls.connect(465, "smtp.gmail.com", {
      rejectUnauthorized: true,
    });

    socket.setEncoding("utf8");

    let buffer = "";
    let stage = "CONNECT";
    const messageId = `<reply-${Date.now()}-${Math.random().toString(36).slice(2)}@gmail.com>`;

    const timeout = setTimeout(() => {
      socket.destroy();
      reject(new Error("SMTP connection timed out (15s)."));
    }, 15000);

    const cleanup = () => {
      clearTimeout(timeout);
      if (!socket.destroyed) {
        socket.destroy();
      }
    };

    socket.on("error", (err) => {
      cleanup();
      reject(err);
    });

    socket.on("data", (chunk: string) => {
      buffer += chunk;

      // Handle multiline responses: only proceed if the line does not have a '-' after code
      const lines = buffer.trim().split("\r\n");
      const lastLine = lines[lines.length - 1];

      // Check if lastLine starts with a 3-digit code followed by space (completed response)
      const isCompleteResponse = /^\d{3}\s/.test(lastLine);
      if (!isCompleteResponse) {
        return; // Wait for full SMTP response
      }

      const code = lastLine.slice(0, 3);
      buffer = ""; // Reset buffer for next step

      try {
        if (code === "220" && stage === "CONNECT") {
          stage = "EHLO";
          socket.write("EHLO localhost\r\n");
        } else if (code === "250" && stage === "EHLO") {
          stage = "AUTH_INIT";
          socket.write("AUTH LOGIN\r\n");
        } else if (code === "334" && stage === "AUTH_INIT") {
          stage = "AUTH_USER";
          socket.write(Buffer.from(user).toString("base64") + "\r\n");
        } else if (code === "334" && stage === "AUTH_USER") {
          stage = "AUTH_PASS";
          socket.write(Buffer.from(pass).toString("base64") + "\r\n");
        } else if (code === "235" && stage === "AUTH_PASS") {
          stage = "MAIL_FROM";
          socket.write(`MAIL FROM:<${user}>\r\n`);
        } else if (code === "250" && stage === "MAIL_FROM") {
          stage = "RCPT_TO";
          socket.write(`RCPT TO:<${to}>\r\n`);
        } else if (code === "250" && stage === "RCPT_TO") {
          stage = "DATA_INIT";
          socket.write("DATA\r\n");
        } else if (code === "354" && stage === "DATA_INIT") {
          stage = "DATA_SEND";
          const recipientHeader = toName ? `"${toName.replace(/"/g, "")}" <${to}>` : `<${to}>`;
          const rawEmail = [
            `From: "Md Abu Rayhan" <${user}>`,
            `To: ${recipientHeader}`,
            `Reply-To: "Md Abu Rayhan" <${user}>`,
            `Subject: =?UTF-8?B?${Buffer.from(subject).toString("base64")}?=`,
            `Message-ID: ${messageId}`,
            `Date: ${new Date().toUTCString()}`,
            "MIME-Version: 1.0",
            "Content-Type: text/html; charset=UTF-8",
            "Content-Transfer-Encoding: base64",
            "",
            Buffer.from(html || text || "").toString("base64"),
            "",
            ".",
          ].join("\r\n") + "\r\n";

          socket.write(rawEmail);
        } else if (code === "250" && stage === "DATA_SEND") {
          stage = "QUIT";
          socket.write("QUIT\r\n");
          cleanup();
          resolve({ success: true, messageId });
        } else if (code === "221" && stage === "QUIT") {
          cleanup();
        } else if (code.startsWith("4") || code.startsWith("5")) {
          cleanup();
          reject(new Error(`SMTP error (${code}): ${lastLine}`));
        }
      } catch (procErr) {
        cleanup();
        reject(procErr);
      }
    });
  });
}

export default sendGmailSmtp;
