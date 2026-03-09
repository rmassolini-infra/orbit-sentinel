export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="h-full p-4 flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-display text-2xl font-semibold mb-2">{title}</h1>
        <p className="text-muted-foreground">Página em desenvolvimento</p>
      </div>
    </div>
  );
}
