require("dotenv").config();

const data = {
    client_first_name: "Laron",
    client_last_name: "Weddington",
    client_email: "laron.weddington@metc.state.mn.us",
    client_street_address: "390 N Robert St",
    client_city: "St Paul",
    client_state: "MN",
    client_zip: "55101",
    re: "Asset Condition Assessment Services",
    proposal_introduction:
        "CR-Building Performance Specialists (CR-BPS) is pleased to submit this proposal for Asset Condition Assessment Services for the Metropolitan Council. Our team is committed to delivering comprehensive assessments that align with MAP-21 requirements, ensuring the highest standards of asset management. We appreciate the opportunity to contribute to the Council's mission of maintaining a state of good repair for its transit assets.",
    proposal_name: "Asset Condition Assessment Proposal",
    proposal_type: "rfp_response",
};

const sendWebhook = async (data) => {
    try {
        const webhookUrl = "https://hook.us2.make.com/nqn7ytobloumtjhxvc0n8wu5aurpc61u";
        const response = await fetch(webhookUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`Webhook failed with status: ${response.status}`);
        }

        const contentType = response.headers.get("content-type") || "";
        let responseBody;
        if (contentType.includes("application/json")) {
            responseBody = await response.json();
        } else {
            responseBody = await response.text();
        }

        return {
            success: response.ok,
            status: response.status,
            // statusText: response.statusText,
            // headers: Object.fromEntries(response.headers.entries()),
            body: responseBody,
        };
    } catch (error) {
        console.error("Webhook error:", error);
        return {
            success: false,
            error: error.message,
            status: error.status || 500,
        };
    }
};

(async () => {
    try {
        const webhook = await sendWebhook(data);
        console.log(`webhook -->`, webhook);
    } catch (error) {
        console.error(error);
    }
})();
