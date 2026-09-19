"use client";

import * as React from "react";
import type { BaseGearPiece } from "@/lib/builder/base-gear";
import { getBaseGearPiece } from "@/lib/builder/base-gear";
import type { BuilderPayload } from "@/lib/builder/types";
import { normalizeBuilderPayload } from "@/lib/builder/normalize-builder-payload";
import { BUILDER_STORAGE_KEYS } from "@/lib/builder/storage-keys";
import type { LocalTransmissionRecord } from "@/components/transmissions/transmissions-vault-client";
import type { CombatSwitchboardState } from "@/components/builder/builder-combat-switchboard";

export interface ActiveTransmissionRecord {
  id: string;
  slug: string;
  title: string;
  description?: string;
  isOwner: boolean;
  editToken?: string;
}

export interface TransmissionStatusMessage {
  type: "success" | "error";
  text: string;
}

export interface UseBuilderShareProps {
  piece: BaseGearPiece;
  payload: BuilderPayload;
  setPayload: React.Dispatch<React.SetStateAction<BuilderPayload>>;
  equippedPerkCards: Array<{ cardId: string; rank: number }>;
  setEquippedPerkCards: React.Dispatch<
    React.SetStateAction<Array<{ cardId: string; rank: number }>>
  >;
  activeWeaponId: string;
  setActiveWeaponId: React.Dispatch<React.SetStateAction<string>>;
  setActiveChassisId: React.Dispatch<React.SetStateAction<string>>;
  switchboardState: CombatSwitchboardState | null;
  setSwitchboardState: React.Dispatch<
    React.SetStateAction<CombatSwitchboardState | null>
  >;
  sharedTransmissionTitle?: string | null;
  targetTransmissionSlug?: string | null;
  isMounted: boolean;
  currentUserId?: string | null;
  isAdmin: boolean;
}

export interface UseBuilderShareResult {
  shareTitle: string;
  setShareTitle: React.Dispatch<React.SetStateAction<string>>;
  shareBusy: boolean;
  shareResult: string | null;
  setShareResult: React.Dispatch<React.SetStateAction<string | null>>;
  shareCopied: boolean;
  setShareCopied: React.Dispatch<React.SetStateAction<boolean>>;
  activeTransmission: ActiveTransmissionRecord | null;
  setActiveTransmission: React.Dispatch<
    React.SetStateAction<ActiveTransmissionRecord | null>
  >;
  transmissionLoading: boolean;
  updateBusy: boolean;
  updateStatus: TransmissionStatusMessage | null;
  shareBuild: () => Promise<void>;
  /** Guests must pass the anti-bot check before publishing; signed-in users skip it. */
  needsTurnstile: boolean;
  setShareTurnstileToken: (token: string) => void;
  /** Changes after every publish so the widget re-renders and issues a fresh (single-use) token. */
  turnstileRenderKey: number;
  updateTransmission: () => Promise<void>;
  exitTransmissionMode: () => void;
}

export function useBuilderShare({
  piece,
  payload,
  setPayload,
  equippedPerkCards,
  setEquippedPerkCards,
  activeWeaponId,
  setActiveWeaponId,
  setActiveChassisId,
  switchboardState,
  setSwitchboardState,
  sharedTransmissionTitle,
  targetTransmissionSlug,
  isMounted,
  currentUserId,
  isAdmin,
}: UseBuilderShareProps): UseBuilderShareResult {
  const [shareTitle, setShareTitle] = React.useState(
    sharedTransmissionTitle || "B.U.I.L.D. Loadout",
  );
  const [shareBusy, setShareBusy] = React.useState(false);
  const [shareResult, setShareResult] = React.useState<string | null>(null);
  const [shareCopied, setShareCopied] = React.useState(false);

  // Active transmission management (loaded from /transmissions or /l/[slug])
  const [activeTransmission, setActiveTransmission] =
    React.useState<ActiveTransmissionRecord | null>(null);
  const [transmissionLoading, setTransmissionLoading] = React.useState(false);
  const [updateBusy, setUpdateBusy] = React.useState(false);
  const [updateStatus, setUpdateStatus] =
    React.useState<TransmissionStatusMessage | null>(null);

  // Synchronize target transmission when ?load=slug or ?edit=slug is provided in URL
  React.useEffect(() => {
    if (!targetTransmissionSlug || !isMounted) return;
    if (activeTransmission?.slug === targetTransmissionSlug) return;

    let cancelled = false;
    setTransmissionLoading(true);

    interface TransmissionResponse {
      success?: boolean;
      data?: {
        id: string;
        slug: string;
        title: string;
        description?: string;
        payload?: Record<string, unknown>;
        userId?: string | null;
        isOwner?: boolean;
      };
    }

    fetch(
      `/api/builder/transmissions/by-slug/${encodeURIComponent(
        targetTransmissionSlug,
      )}`,
    )
      .then(async (res) => {
        if (!res.ok) throw new Error("Transmission not found");
        return (await res.json()) as TransmissionResponse;
      })
      .then((json: TransmissionResponse) => {
        if (cancelled || !json?.success || !json?.data) return;
        const item = json.data;

        // Check ownership from session, server isOwner flag, or localStorage roll_my_transmissions
        let localToken: string | undefined;
        try {
          const raw = localStorage.getItem(
            BUILDER_STORAGE_KEYS.myTransmissions,
          );
          if (raw) {
            const list: LocalTransmissionRecord[] = JSON.parse(raw);
            const match = list.find(
              (x) => x.slug === item.slug || x.id === item.id,
            );
            if (match?.editToken) {
              localToken = match.editToken;
            }
          }
        } catch {
          // ignore
        }

        const isOwner = Boolean(
          item.isOwner ||
            localToken ||
            (item.userId && currentUserId && item.userId === currentUserId) ||
            isAdmin,
        );

        setActiveTransmission({
          id: item.id,
          slug: item.slug,
          title: item.title,
          description: item.description,
          isOwner,
          editToken: localToken,
        });

        if (item.title) {
          setShareTitle(item.title);
        }

        if (item.payload) {
          const norm = normalizeBuilderPayload(item.payload) || item.payload;
          if (norm && typeof norm === "object") {
            setPayload(norm as BuilderPayload);
            const payloadObj = norm as Record<string, unknown>;
            const basePieceId =
              typeof payloadObj.basePieceId === "string"
                ? payloadObj.basePieceId
                : undefined;
            if (basePieceId) {
              const base = getBaseGearPiece(basePieceId);
              if (base?.kind === "weapon") {
                setActiveWeaponId(base.id);
              } else if (base?.kind === "armor" || base?.kind === "powerArmor") {
                setActiveChassisId(base.id);
              }
            }
            if (
              typeof payloadObj.activeWeaponPieceId === "string" &&
              payloadObj.activeWeaponPieceId
            ) {
              setActiveWeaponId(payloadObj.activeWeaponPieceId);
            }
            if (
              Array.isArray(payloadObj.equippedPerkCards) &&
              payloadObj.equippedPerkCards.length > 0
            ) {
              setEquippedPerkCards(
                payloadObj.equippedPerkCards as Array<{
                  cardId: string;
                  rank: number;
                }>,
              );
            }
            if (
              payloadObj.switchboardState &&
              typeof payloadObj.switchboardState === "object"
            ) {
              setSwitchboardState(
                payloadObj.switchboardState as unknown as CombatSwitchboardState,
              );
            }
          }
        }
      })
      .catch((err) => {
        console.error("Failed to load transmission:", err);
      })
      .finally(() => {
        if (!cancelled) setTransmissionLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    targetTransmissionSlug,
    isMounted,
    currentUserId,
    isAdmin,
    activeTransmission?.slug,
    setPayload,
    setActiveWeaponId,
    setActiveChassisId,
    setEquippedPerkCards,
    setSwitchboardState,
  ]);

  const [shareTurnstileToken, setShareTurnstileTokenState] = React.useState<string | null>(null);
  const [turnstileRenderKey, setTurnstileRenderKey] = React.useState(0);
  const setShareTurnstileToken = React.useCallback((token: string) => {
    setShareTurnstileTokenState(token || null);
  }, []);

  async function shareBuild() {
    setShareBusy(true);
    setShareResult(null);
    try {
      const response = await fetch("/api/builder/share", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: shareTitle,
          description: `${piece.label} · ${
            payload.ghoul ? "Ghoul" : "Human"
          } · sandbox`,
          payload: {
            ...payload,
            equippedPerkCards,
            activeWeaponPieceId: activeWeaponId,
            switchboardState: switchboardState
              ? (switchboardState as unknown as Record<string, unknown>)
              : undefined,
          },
          turnstileToken: currentUserId ? undefined : shareTurnstileToken,
        }),
      });
      const body = (await response.json()) as {
        success?: boolean;
        data?: {
          id?: string;
          slug?: string;
          path?: string;
          editToken?: string;
        };
        error?: { message?: string };
      };
      if (!response.ok || !body?.success) {
        throw new Error(body?.error?.message ?? "Share failed.");
      }
      const path = body.data?.path;
      const slug = body.data?.slug;
      const id = body.data?.id;
      const editToken = body.data?.editToken;
      setShareResult(path ?? "");

      // Save to localStorage roll_my_transmissions for author tracking
      if (id && slug) {
        try {
          const raw = localStorage.getItem(
            BUILDER_STORAGE_KEYS.myTransmissions,
          );
          const list: LocalTransmissionRecord[] = raw ? JSON.parse(raw) : [];
          const updated = [
            {
              id,
              slug,
              title: shareTitle,
              editToken,
              createdAt: new Date().toISOString(),
            },
            ...list.filter((x) => x.id !== id && x.slug !== slug),
          ];
          localStorage.setItem(
            BUILDER_STORAGE_KEYS.myTransmissions,
            JSON.stringify(updated),
          );
        } catch {
          // ignore
        }

        // Switch active transmission to the newly saved build
        setActiveTransmission({
          id,
          slug,
          title: shareTitle,
          isOwner: true,
          editToken,
        });
      }
    } catch (e) {
      setShareResult(e instanceof Error ? e.message : "Share failed.");
    } finally {
      setShareBusy(false);
      // Turnstile tokens are single-use: get a fresh one for the next publish.
      if (!currentUserId) {
        setShareTurnstileTokenState(null);
        setTurnstileRenderKey((k) => k + 1);
      }
    }
  }

  async function updateTransmission() {
    if (!activeTransmission) return;
    setUpdateBusy(true);
    setUpdateStatus(null);
    try {
      const response = await fetch(
        `/api/builder/transmissions/${activeTransmission.id}`,
        {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            title: shareTitle,
            description: `${piece.label} · ${
              payload.ghoul ? "Ghoul" : "Human"
            } · sandbox`,
            payload: {
              ...payload,
              equippedPerkCards,
              activeWeaponPieceId: activeWeaponId,
              switchboardState: switchboardState
                ? (switchboardState as unknown as Record<string, unknown>)
                : undefined,
            },
            editToken: activeTransmission.editToken,
          }),
        },
      );
      const body = (await response.json()) as {
        success?: boolean;
        error?: string;
      };
      if (!response.ok || !body?.success) {
        throw new Error(body?.error ?? "Update failed.");
      }

      // Update title in localStorage roll_my_transmissions if present
      try {
        const raw = localStorage.getItem(
          BUILDER_STORAGE_KEYS.myTransmissions,
        );
        if (raw) {
          const list: LocalTransmissionRecord[] = JSON.parse(raw);
          const updated = list.map((item) =>
            item.id === activeTransmission.id ||
            item.slug === activeTransmission.slug
              ? { ...item, title: shareTitle }
              : item,
          );
          localStorage.setItem(
            BUILDER_STORAGE_KEYS.myTransmissions,
            JSON.stringify(updated),
          );
        }
      } catch {
        // ignore
      }

      setActiveTransmission((prev) =>
        prev ? { ...prev, title: shareTitle } : null,
      );
      setUpdateStatus({
        type: "success",
        text: "Transmission updated in vault!",
      });
      setTimeout(() => setUpdateStatus(null), 4000);
    } catch (e) {
      setUpdateStatus({
        type: "error",
        text:
          e instanceof Error ? e.message : "Failed to update transmission.",
      });
    } finally {
      setUpdateBusy(false);
    }
  }

  function exitTransmissionMode() {
    setActiveTransmission(null);
    setUpdateStatus(null);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("edit");
      url.searchParams.delete("load");
      window.history.replaceState({}, "", url.toString());
    }
  }

  return {
    shareTitle,
    setShareTitle,
    shareBusy,
    shareResult,
    setShareResult,
    shareCopied,
    setShareCopied,
    activeTransmission,
    setActiveTransmission,
    transmissionLoading,
    updateBusy,
    updateStatus,
    shareBuild,
    needsTurnstile: !currentUserId,
    setShareTurnstileToken,
    turnstileRenderKey,
    updateTransmission,
    exitTransmissionMode,
  };
}
