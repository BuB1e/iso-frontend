import type { LoaderFunctionArgs } from "react-router";
import { SuggestionService } from "~/services";

export async function loader({ params }: LoaderFunctionArgs) {
  const controlId = Number(params.controlId);
  if (!controlId || isNaN(controlId)) {
    return { suggestion: null };
  }

  const suggestion =
    await SuggestionService.getSuggestionByControlId(controlId);
  return { suggestion };
}
