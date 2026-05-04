import { apiHandler } from "@/lib/http";
import { getCurrentUser } from "@/lib/services/auth";
import { listUserProjects } from "@/lib/services/projects";

export async function GET() {
  return apiHandler(async () => {
    const user = await getCurrentUser();
    const projects = await listUserProjects(user);
    return { projects };
  });
}
