import { ApplicationForm } from "@/features/applications/application-form";

export default function NewApplicationPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Nouvelle entree
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-normal sm:text-5xl">
          Ajouter une candidature
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
          Creez une fiche propre pour suivre l'offre, le poste, le statut actuel et la
          prochaine etape.
        </p>
      </div>
      <ApplicationForm mode="create" />
    </div>
  );
}
