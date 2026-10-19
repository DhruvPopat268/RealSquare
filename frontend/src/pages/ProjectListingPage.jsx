import ChatbotPage from "./ChatbotPage";
import { projectListingFlow } from "../chatbot/ProjectListingFlow";

export default function ProjectListingPage() {
  return (
    <ChatbotPage
      flow={projectListingFlow}
      assistantTitle="RealSquare Project Listing Assistant"
      projectListing
    />
  );
}
