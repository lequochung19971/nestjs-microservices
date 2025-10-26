import { useState } from "react";
import {
  ReservationsTable,
  CreateReservationDialog,
  ReservationActionsDialog,
} from "@/modules/inventory/components";
import type { InventoryReservationDto } from "@/modules/inventory/types";

export function ReservationsPage() {
  // Reservations state
  const [createReservationDialogOpen, setCreateReservationDialogOpen] =
    useState(false);
  const [reservationActionsDialogOpen, setReservationActionsDialogOpen] =
    useState(false);
  const [selectedReservation, setSelectedReservation] =
    useState<InventoryReservationDto | null>(null);

  // Reservation handlers
  const handleCreateReservation = () => {
    setCreateReservationDialogOpen(true);
  };

  const handleManageReservation = (reservation: InventoryReservationDto) => {
    setSelectedReservation(reservation);
    setReservationActionsDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Inventory Reservations</h1>
      </div>

      <div className="space-y-4">
        <ReservationsTable
          onCreateReservation={handleCreateReservation}
          onManageReservation={handleManageReservation}
        />

        <CreateReservationDialog
          open={createReservationDialogOpen}
          onOpenChange={setCreateReservationDialogOpen}
        />

        <ReservationActionsDialog
          reservationId={selectedReservation?.id || null}
          open={reservationActionsDialogOpen}
          onOpenChange={setReservationActionsDialogOpen}
        />
      </div>
    </div>
  );
}
