const webhook = "https://hook.us2.make.com/81uz2hbqbz5xhevpgkvkeiqi3zbagliy";

const sendTestWebhook = async () => {
    const testData = {
        client_first_name: "John",
        client_last_name: "Doe",
        client_email: "john.doe@example.com",
        client_street_address: "123 Main St",
        client_city: "Anytown",
        client_state: "CA",
        client_zip: "90210",
        re: "City of Duluth Fire Hall",
        proposal_introduction:
            'CR-Building Performance Specialists, GBC ("CR-BPS", or "Consultant") is pleased to submit this proposal letter for high-performance architecture consulting services for a new residence located in LaPointe, WI on Madeline Island. The intent of our scope of work is to provide professional services to develop a complete set of construction documents, along with providing construction observation, performance testing & verification through construction. We appreciate the opportunity to provide professional services for this project.',
        proposal_name: "Letter Proposal - TESTER",
        proposal_type: "letter",
    };

    try {
        const response = await fetch(webhook, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(testData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.text();
        console.log("Webhook sent successfully!");
        console.log("Response:", result);
    } catch (error) {
        console.error("Error sending webhook:", error);
    }
};

// Execute the function
sendTestWebhook();
