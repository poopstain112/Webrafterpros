import { WebsiteVariantViewer } from "../components/WebsiteVariantViewer";

export function VariantPreview() {
  return (
    <WebsiteVariantViewer 
      websiteId={1} 
      businessData="Pontoon boat rental company | Poseidon's Boat Rentals | Bold and vibrant. God like"
    />
  );
}