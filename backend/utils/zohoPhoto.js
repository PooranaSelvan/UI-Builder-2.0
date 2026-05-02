export async function fetchZohoProfilePhoto(accessToken) {

     const endpoints = [
          { label: "Zoho Contacts", url: "https://contacts.zoho.in/api/v1/user/self/photo" },
          { label: "Zoho Accounts", url: "https://accounts.zoho.in/oauth/user/photo" },
     ];

     // Try each endpoint — first successful one wins
     for (const ep of endpoints) {
          try {
               const response = await fetch(ep.url, {
                    headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
                    redirect: "follow",
               });

               if (!response.ok) continue;

               const contentType = response.headers.get("content-type") || "";

               if (contentType.includes("application/json") || contentType.includes("text/html")) {
                    await response.text(); 
                    continue;
               }

               if (contentType.startsWith("image/")) {
                    const imageBuffer = Buffer.from(await response.arrayBuffer());
                    if (imageBuffer.length < 100) continue;

                    const mimeType = contentType.split(";")[0].trim();
                    const base64String = imageBuffer.toString("base64");

                    return `data:${mimeType};base64,${base64String}`;
               }

          } catch (err) {
               console.warn(`${ep.label} photo fetch failed:`, err.message);
          }
     }
     return null;
}
