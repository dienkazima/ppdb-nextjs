"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function deletePendaftar(id: number) {
  await prisma.pendaftar.delete({
    where: { id },
  })

  revalidatePath("/admin")
}
