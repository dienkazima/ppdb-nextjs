"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function deletePendaftar(id: string) {
  await prisma.pendaftar.delete({
    where: { id },
  })

  revalidatePath("/admin")
}
