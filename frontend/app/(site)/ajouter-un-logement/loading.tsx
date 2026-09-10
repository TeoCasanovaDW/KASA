import Container from "@/components/layout/Container";
import PropertyGridSkeleton from "@/components/layout/PropertyGridSkeleton";

export default function Loading() {
  return (
    <Container className="pt-10">
      <PropertyGridSkeleton />
    </Container>
  );
}
