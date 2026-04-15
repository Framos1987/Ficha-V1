import { useState } from "react";
import { X, Plus, Sword, Shield, Zap, ShieldCheck, ShoppingCart, Check, Search, Gem, Crown, Backpack } from "lucide-react";
import { InventoryItem, BodyPart, ArmorLayer } from "../types";
import { RUNE_CATALOG, RUNE_POTENCIAS, RUNE_COLOR_CLASSES, RuneCatalogEntry } from "../lib/runeCatalog";

interface ItemCatalogProps {
  onClose: () => void;
  onAddItem: (item: Omit<InventoryItem, "id">) => void;
}

const WEAPON_CATEGORIES = [
  {
    name: "Esgrima Militar",
    weapons: [
      { name: "Alabarda", baseWeight: 2.5, weightStep: 0.25, prog: ["2d3","2d6","4d6","6d6","8d6","10d6","12d6","14d6","16d6","18d6","20d6"] },
      { name: "Bastarda", baseWeight: 5, weightStep: 0.5, prog: ["2d5","2d10","4d10","6d10","8d10","10d10","12d10","14d10","16d10","18d10","20d10"] },
      { name: "Claymore", baseWeight: 5, weightStep: 0.5, prog: ["1d10","1d20","2d20","3d20","4d20","5d20","6d20","7d20","8d20","9d20","10d20"] },
      { name: "Colubrina", baseWeight: 2.5, weightStep: 0.25, prog: ["1d5 + 1","1d10 + 1","2d10 + 2","3d10 + 3","4d10 + 4","5d10 + 5","6d10 + 6","7d10 + 7","8d10 + 8","9d10 + 9","10d10 + 10"] },
      { name: "Estoque", baseWeight: 5, weightStep: 0.5, prog: ["1d10 × 1","1d20 × 1","1d20 × 2","1d20 × 3","1d20 × 4","1d20 × 5","1d20 × 6","1d20 × 7","1d20 × 8","1d20 × 9","1d20 × 10"] },
      { name: "Gadanha", baseWeight: 2.5, weightStep: 0.25, prog: ["1d6","1d12","2d12","3d12","4d12","5d12","6d12","7d12","8d12","9d12","10d12"] },
      { name: "Kampilan", baseWeight: 2.5, weightStep: 0.25, prog: ["2d3","2d6","4d6","6d6","8d6","10d6","12d6","14d6","16d6","18d6","20d6"] },
      { name: "Katana", baseWeight: 2.5, weightStep: 0.25, prog: ["1d6","1d12","2d12","3d12","4d12","5d12","6d12","7d12","8d12","9d12","10d12"] },
      { name: "Khanda", baseWeight: 2.5, weightStep: 0.25, prog: ["3","6","13","19","26","32","39","45","52","58","65"] },
      { name: "Malho", baseWeight: 2.5, weightStep: 0.25, prog: ["5","10","21","31","42","52","63","73","84","94","105"] },
      { name: "Montante", baseWeight: 5, weightStep: 0.5, prog: ["1d10","1d20","2d20","3d20","4d20","5d20","6d20","7d20","8d20","9d20","10d20"] },
      { name: "Marreta", baseWeight: 2.5, weightStep: 0.25, prog: ["5","10","21","31","42","52","63","73","84","94","105"] },
      { name: "Odachi", baseWeight: 5, weightStep: 0.5, prog: ["2d5","2d10","4d10","6d10","8d10","10d10","12d10","14d10","16d10","18d10","20d10"] },
      { name: "Pique", baseWeight: 2.5, weightStep: 0.25, prog: ["1d6 × 1","1d12 × 1","1d12 × 2","1d12 × 3","1d12 × 4","1d12 × 5","1d12 × 6","1d12 × 7","1d12 × 8","1d12 × 9","1d12 × 10"] },
      { name: "Zweihander", baseWeight: 2.5, weightStep: 0.25, prog: ["1d5 + 1","1d10 + 1","2d10 + 2","3d10 + 3","4d10 + 4","5d10 + 5","6d10 + 6","7d10 + 7","8d10 + 8","9d10 + 9","10d10 + 10"] },
      { name: "Tridente", baseWeight: 2.5, weightStep: 0.25, prog: ["3","6","13","19","26","32","39","45","52","58","65"] },
      { name: "Sarissa", baseWeight: 5, weightStep: 0.5, prog: ["1d10 × 1","1d20 × 1","1d20 × 2","1d20 × 3","1d20 × 4","1d20 × 5","1d20 × 6","1d20 × 7","1d20 × 8","1d20 × 9","1d20 × 10"] },
      { name: "Sabre", baseWeight: 5, weightStep: 0.5, prog: ["1d6 × 1","1d12 × 1","1d12 × 2","1d12 × 3","1d12 × 4","1d12 × 5","1d12 × 6","1d12 × 7","1d12 × 8","1d12 × 9","1d12 × 10"] }
    ].map(w => ({
      name: w.name,
      baseWeight: w.baseWeight,
      weightStep: w.weightStep,
      getBonus: (t: number, type: "metal" | "wood" | "crystal") => {
        const bonusType = type === "metal" ? "Físico" : type === "wood" ? "Mágico" : "Místico";
        return `Ataque ${bonusType} Armado + ${w.prog[t - 1] || w.prog[0]}`;
      },
      getExtraStats: () => {
        return "";
      }
    }))
  },
  {
    name: "Esgrima Civil",
    weapons: [
      { name: "Adagas", baseWeight: 0.5, weightStep: 0.05, prog: ["1d3","1d6","2d6","3d6","4d6","5d6","6d6","7d6","8d6","9d6","10d6"] },
      { name: "Bengalas", baseWeight: 0.25, weightStep: 0.025, prog: ["1d2","1d4","2d4","3d4","4d4","5d4","6d4","7d4","8d4","9d4","10d4"] },
      { name: "Caniços", baseWeight: 0.25, weightStep: 0.025, prog: ["1d3 - 1","1d6 - 1","2d6 - 2","3d6 - 3","4d6 - 4","5d6 - 5","6d6 - 6","7d6 - 7","8d6 - 8","9d6 - 9","10d6 - 10"] },
      { name: "Chicotes", baseWeight: 0.25, weightStep: 0.025, prog: ["1d2 × 1","1d4 × 1","1d4 × 2","1d4 × 3","1d4 × 4","1d4 × 5","1d4 × 6","1d4 × 7","1d4 × 8","1d4 × 9","1d4 × 10"] },
      { name: "Cinzéis", baseWeight: 0.25, weightStep: 0.025, prog: ["1","2","5","7","10","12","15","17","20","22","25"] },
      { name: "Cutelos", baseWeight: 0.25, weightStep: 0.025, prog: ["1d3 - 1","1d6 - 1","2d6 - 2","3d6 - 3","4d6 - 4","5d6 - 5","6d6 - 6","7d6 - 7","8d6 - 8","9d6 - 9","10d6 - 10"] },
      { name: "Espetos", baseWeight: 0.25, weightStep: 0.025, prog: ["1d2 × 1","1d4 × 1","1d4 × 2","1d4 × 3","1d4 × 4","1d4 × 5","1d4 × 6","1d4 × 7","1d4 × 8","1d4 × 9","1d4 × 10"] },
      { name: "Enxadas", baseWeight: 0.5, weightStep: 0.05, prog: ["1d3","1d6","1d12","1d12 + 1d6","2d12","2d12 + 1d6","3d12","3d12 + 1d6","4d12","4d12 + 1d6","5d12"] },
      { name: "Facas", baseWeight: 0.25, weightStep: 0.025, prog: ["1d2","1d4","2d4","3d4","4d4","5d4","6d4","7d4","8d4","9d4","10d4"] },
      { name: "Foices", baseWeight: 0.25, weightStep: 0.025, prog: ["1d2","1d4","1d8","1d8 + 1d4","2d8","2d8 + 1d4","3d8","3d8 + 1d4","4d8","4d8 + 1d4","5d8"] },
      { name: "Guarda-Chuvas", baseWeight: 0.5, weightStep: 0.05, prog: ["1d2 + 1","1d4 + 1","2d4 + 2","3d4 + 3","4d4 + 4","5d4 + 5","6d4 + 6","7d4 + 7","8d4 + 8","9d4 + 9","10d4 + 10"] },
      { name: "Hastes", baseWeight: 0.5, weightStep: 0.05, prog: ["1d4 - 1","1d8 - 1","2d8 - 2","3d8 - 3","4d8 - 4","5d8 - 5","6d8 - 6","7d8 - 7","8d8 - 8","9d8 - 9","10d8 - 10"] },
      { name: "Machados", baseWeight: 0.5, weightStep: 0.05, prog: ["1d4 - 1","1d8 - 1","2d8 - 2","3d8 - 3","4d8 - 4","5d8 - 5","6d8 - 6","7d8 - 7","8d8 - 8","9d8 - 9","10d8 - 10"] },
      { name: "Machetes", baseWeight: 0.5, weightStep: 0.05, prog: ["1d3","1d6","1d12","1d12 + 1d6","2d12","2d12 + 1d6","3d12","3d12 + 1d6","4d12","4d12 + 1d6","5d12"] },
      { name: "Martelos", baseWeight: 0.5, weightStep: 0.05, prog: ["1","3","7","10","14","17","21","24","28","31","35"] },
      { name: "Pás", baseWeight: 0.25, weightStep: 0.025, prog: ["1d2","1d4","1d8","1d8 + 1d4","2d8","2d8 + 1d4","3d8","3d8 + 1d4","4d8","4d8 + 1d4","5d8"] },
      { name: "Picaretas", baseWeight: 0.5, weightStep: 0.05, prog: ["1d3 × 1","1d6 × 1","1d6 × 2","1d6 × 3","1d6 × 4","1d6 × 5","1d6 × 6","1d6 × 7","1d6 × 8","1d6 × 9","1d6 × 10"] },
      { name: "Rastelos", baseWeight: 0.5, weightStep: 0.05, prog: ["1d3","1d6","2d6","3d6","4d6","5d6","6d6","7d6","8d6","9d6","10d6"] },
      { name: "Shillelaghs", baseWeight: 0.25, weightStep: 0.025, prog: ["1","2","5","7","10","12","15","17","20","22","25"] },
      { name: "Tacos", baseWeight: 0.5, weightStep: 0.05, prog: ["1","3","7","10","14","17","21","24","28","31","35"] },
      { name: "Tesouras", baseWeight: 0.5, weightStep: 0.05, prog: ["1d2 + 1","1d4 + 1","2d4 + 2","3d4 + 3","4d4 + 4","5d4 + 5","6d4 + 6","7d4 + 7","8d4 + 8","9d4 + 9","10d4 + 10"] },
      { name: "Urumis", baseWeight: 0.5, weightStep: 0.05, prog: ["1d3 × 1","1d6 × 1","1d6 × 2","1d6 × 3","1d6 × 4","1d6 × 5","1d6 × 6","1d6 × 7","1d6 × 8","1d6 × 9","1d6 × 10"] }
    ].map(w => ({
      name: w.name,
      baseWeight: w.baseWeight,
      weightStep: w.weightStep,
      getBonus: (t: number, type: "metal" | "wood" | "crystal") => {
        const bonusType = type === "metal" ? "Físico" : type === "wood" ? "Mágico" : "Místico";
        return `Ataque ${bonusType} Armado + ${w.prog[t - 1] || w.prog[0]}`;
      },
      getExtraStats: () => {
        return "";
      }
    }))
  },
  {
    name: "Esgrima Marcial",
    weapons: [
      { name: "Bastões", baseWeight: 0.75, weightStep: 0.075, prog: ["1d4","1d8","2d8","3d8","4d8","5d8","6d8","7d8","8d8","9d8","10d8"] },
      { name: "Chigirikis", baseWeight: 0.75, weightStep: 0.075, prog: ["2d2","2d4","4d4","6d4","8d4","10d4","12d4","14d4","16d4","18d4","20d4"] },
      { name: "Chuís", baseWeight: 0.75, weightStep: 0.075, prog: ["1d3 + 1","1d6 + 1","2d6 + 2","3d6 + 3","4d6 + 4","5d6 + 5","6d6 + 6","7d6 + 7","8d6 + 8","9d6 + 9","10d6 + 10"] },
      { name: "Cimitarras", baseWeight: 1.5, weightStep: 0.15, prog: ["1d6 - 1","1d12 - 1","2d12 - 2","3d12 - 3","4d12 - 4","5d12 - 5","6d12 - 6","7d12 - 7","8d12 - 8","9d12 - 9","10d12 - 10"] },
      { name: "Cinquedeas", baseWeight: 0.75, weightStep: 0.075, prog: ["1d3 + 1","1d6 + 1","2d6 + 2","3d6 + 3","4d6 + 4","5d6 + 5","6d6 + 6","7d6 + 7","8d6 + 8","9d6 + 9","10d6 + 10"] },
      { name: "Clavas", baseWeight: 0.75, weightStep: 0.075, prog: ["2d2","2d4","4d4","6d4","8d4","10d4","12d4","14d4","16d4","18d4","20d4"] },
      { name: "Espadas", baseWeight: 1.5, weightStep: 0.15, prog: ["1d5","1d10","2d10","3d10","4d10","5d10","6d10","7d10","8d10","9d10","10d10"] },
      { name: "Flyssas", baseWeight: 1.5, weightStep: 0.15, prog: ["1d5 × 1","1d10 × 1","1d10 × 2","1d10 × 3","1d10 × 4","1d10 × 5","1d10 × 6","1d10 × 7","1d10 × 8","1d10 × 9","1d10 × 10"] },
      { name: "Gládios", baseWeight: 0.75, weightStep: 0.075, prog: ["1d4","1d8","2d8","3d8","4d8","5d8","6d8","7d8","8d8","9d8","10d8"] },
      { name: "Jittes", baseWeight: 1.5, weightStep: 0.15, prog: ["2","5","11","16","22","27","33","38","44","49","55"] },
      { name: "Khopeshs", baseWeight: 0.75, weightStep: 0.075, prog: ["1d4 × 1","1d8 × 1","1d8 × 2","1d8 × 3","1d8 × 4","1d8 × 5","1d8 × 6","1d8 × 7","1d8 × 8","1d8 × 9","1d8 × 10"] },
      { name: "Kodachis", baseWeight: 0.75, weightStep: 0.075, prog: ["1d5 - 1","1d10 - 1","2d10 - 2","3d10 - 3","4d10 - 4","5d10 - 5","6d10 - 6","7d10 - 7","8d10 - 8","9d10 - 9","10d10 - 10"] },
      { name: "Kusarigamas", baseWeight: 1.5, weightStep: 0.15, prog: ["1d6 - 1","1d12 - 1","2d12 - 2","3d12 - 3","4d12 - 4","5d12 - 5","6d12 - 6","7d12 - 7","8d12 - 8","9d12 - 9","10d12 - 10"] },
      { name: "Lanças", baseWeight: 1.5, weightStep: 0.15, prog: ["1d5","1d10","2d10","3d10","4d10","5d10","6d10","7d10","8d10","9d10","10d10"] },
      { name: "Maças", baseWeight: 1.5, weightStep: 0.15, prog: ["1d5","1d10","1d20","1d20 + 1d10","2d20","2d20 + 1d10","3d20","3d20 + 1d10","4d20","4d20 + 1d10","5d20"] },
      { name: "Manguais", baseWeight: 1.5, weightStep: 0.15, prog: ["1d5","1d10","1d20","1d20 + 1d10","2d20","2d20 + 1d10","3d20","3d20 + 1d10","4d20","4d20 + 1d10","5d20"] },
      { name: "Nagamakis", baseWeight: 1.5, weightStep: 0.15, prog: ["1d5 × 1","1d10 × 1","1d10 × 2","1d10 × 3","1d10 × 4","1d10 × 5","1d10 × 6","1d10 × 7","1d10 × 8","1d10 × 9","1d10 × 10"] },
      { name: "Nunchakus", baseWeight: 0.75, weightStep: 0.075, prog: ["2","4","9","13","18","22","27","31","36","40","45"] },
      { name: "Ranseurs", baseWeight: 1.5, weightStep: 0.15, prog: ["1d4 + 1","1d8 + 1","2d8 + 2","3d8 + 3","4d8 + 4","5d8 + 5","6d8 + 6","7d8 + 7","8d8 + 8","9d8 + 9","10d8 + 10"] },
      { name: "Rapieiras", baseWeight: 0.75, weightStep: 0.075, prog: ["1d4 × 1","1d8 × 1","1d8 × 2","1d8 × 3","1d8 × 4","1d8 × 5","1d8 × 6","1d8 × 7","1d8 × 8","1d8 × 9","1d8 × 10"] },
      { name: "Shamshirs", baseWeight: 1.5, weightStep: 0.15, prog: ["1d4 + 1","1d8 + 1","2d8 + 2","3d8 + 3","4d8 + 4","5d8 + 5","6d8 + 6","7d8 + 7","8d8 + 8","9d8 + 9","10d8 + 10"] },
      { name: "Surujins", baseWeight: 0.75, weightStep: 0.075, prog: ["1d5 - 1","1d10 - 1","2d10 - 2","3d10 - 3","4d10 - 4","5d10 - 5","6d10 - 6","7d10 - 7","8d10 - 8","9d10 - 9","10d10 - 10"] }
    ].map(w => ({
      name: w.name,
      baseWeight: w.baseWeight,
      weightStep: w.weightStep,
      getBonus: (t: number, type: "metal" | "wood" | "crystal") => {
        const bonusType = type === "metal" ? "Físico" : type === "wood" ? "Mágico" : "Místico";
        return `Ataque ${bonusType} Armado + ${w.prog[t - 1] || w.prog[0]}`;
      },
      getExtraStats: () => {
        return "";
      }
    }))
  },
  {
    name: "Arremesso",
    weapons: [
      { name: "Valaris", baseWeight: 0.1, weightStep: 0.01, prog: ["1d3 × 1","1d6 × 1","1d6 × 2","1d6 × 3","1d6 × 4","1d6 × 5","1d6 × 6","1d6 × 7","1d6 × 8","1d6 × 9","1d6 × 10"], stats: {"difficulty":"Destreza Vs 1d20","range":"Força × 10","mult":1,"dim":"50 x 8 x 1 cm"} },
      { name: "Trumbashs", baseWeight: 0.5, weightStep: 0.05, prog: ["1d5 × 1","1d10 × 1","1d10 × 2","1d10 × 3","1d10 × 4","1d10 × 5","1d10 × 6","1d10 × 7","1d10 × 8","1d10 × 9","1d10 × 10"], stats: {"difficulty":"Destreza Vs 1d20","range":"Força × 2","mult":1,"dim":"35 x 20 x 5 cm"} },
      { name: "Shurikens", baseWeight: 0.05, weightStep: 0.005, prog: ["1d2 × 1","1d4 × 1","1d4 × 2","1d4 × 3","1d4 × 4","1d4 × 5","1d4 × 6","1d4 × 7","1d4 × 8","1d4 × 9","1d4 × 10"], stats: {"difficulty":"Destreza Vs 1d20","range":"Força × 25","mult":1,"dim":"N/A"} },
      { name: "Arpões", baseWeight: 1.5, weightStep: 0.15, prog: ["1d10","1d20","2d20","3d20","4d20","5d20","6d20","7d20","8d20","9d20","10d20"], stats: {"difficulty":"Destreza Vs 1d20","range":"Força ÷ 2","mult":1,"dim":"N/A"} },
      { name: "Iklwas", baseWeight: 0.5, weightStep: 0.05, prog: ["1d5","1d10","2d10","3d10","4d10","5d10","6d10","7d10","8d10","9d10","10d10"], stats: {"difficulty":"Destreza Vs 1d20","range":"Força × 2","mult":1,"dim":"N/A"} },
      { name: "Chakrams", baseWeight: 0.25, weightStep: 0.025, prog: ["1d4 × 1","1d8 × 1","1d8 × 2","1d8 × 3","1d8 × 4","1d8 × 5","1d8 × 6","1d8 × 7","1d8 × 8","1d8 × 9","1d8 × 10"], stats: {"difficulty":"Destreza Vs 1d20","range":"Força × 5","mult":1,"dim":"20 x 20 x 1 cm"} },
      { name: "Franquisques", baseWeight: 1.5, weightStep: 0.15, prog: ["1d10 × 1","1d20 × 1","1d20 × 2","1d20 × 3","1d20 × 4","1d20 × 5","1d20 × 6","1d20 × 7","1d20 × 8","1d20 × 9","1d20 × 10"], stats: {"difficulty":"Destreza Vs 1d20","range":"Força ÷ 2","mult":1,"dim":"N/A"} },
      { name: "Kunais", baseWeight: 0.1, weightStep: 0.01, prog: ["1d3","1d6","2d6","3d6","4d6","5d6","6d6","7d6","8d6","9d6","10d6"], stats: {"difficulty":"Destreza Vs 1d20","range":"Força × 10","mult":1,"dim":"6 x 20 x 3 cm"} },
      { name: "Mambeles", baseWeight: 0.75, weightStep: 0.075, prog: ["1d6","1d12","2d12","3d12","4d12","5d12","6d12","7d12","8d12","9d12","10d12"], stats: {"difficulty":"Destreza Vs 1d20","range":"Força","mult":1,"dim":"45 x 30 x 4 cm"} },
      { name: "Pilos", baseWeight: 0.75, weightStep: 0.075, prog: ["1d6 × 1","1d12 × 1","1d12 × 2","1d12 × 3","1d12 × 4","1d12 × 5","1d12 × 6","1d12 × 7","1d12 × 8","1d12 × 9","1d12 × 10"], stats: {"difficulty":"Destreza Vs 1d20","range":"Força","mult":1,"dim":"N/A"} },
      { name: "Saunions", baseWeight: 0.25, weightStep: 0.025, prog: ["1d4","1d8","2d8","3d8","4d8","5d8","6d8","7d8","8d8","9d8","10d8"], stats: {"difficulty":"Destreza Vs 1d20","range":"Força × 5","mult":1,"dim":"N/A"} },
      { name: "Senbons", baseWeight: 0.05, weightStep: 0.005, prog: ["1d2","1d4","2d4","3d4","4d4","5d4","6d4","7d4","8d4","9d4","10d4"], stats: {"difficulty":"Destreza Vs 1d20","range":"Força × 25","mult":1,"dim":"1 x 15 x 1 cm"} }
    ].map(w => ({
      name: w.name,
      baseWeight: w.baseWeight,
      weightStep: w.weightStep,
      getBonus: (t: number, type: "metal" | "wood" | "crystal") => {
        const bonusType = type === "metal" ? "Físico" : type === "wood" ? "Mágico" : "Místico";
        const attackType = (w.stats as any).attackType || "Armado";
        const suffix = (w.stats as any).suffix || "";
        return `Ataque ${bonusType} ${attackType} + ${w.prog[t - 1] || w.prog[0]}${suffix}`;
      },
      getExtraStats: () => {
        const s = w.stats as any;
        let parts = [];
        if (s.difficulty) parts.push(`Dificuldade: ${s.difficulty}`);
        if (s.range) parts.push(`Alcance: ${s.range}`);
        if (s.mult) parts.push(`Multiplicador: ${s.mult}`);
        if (s.ammo) parts.push(`Munição: ${s.ammo}`);
        if (s.chamber) parts.push(`Câmara: ${s.chamber}`);
        if (s.mag) parts.push(`Carregador: ${s.mag}`);
        if (s.fire) parts.push(`Disparo: ${s.fire}`);
        if (s.rate) parts.push(`Cadência: ${s.rate}`);
        if (s.area) parts.push(`Área: ${s.area}`);
        if (s.load) parts.push(`Carregar: ${s.load}`);
        if (s.dim && s.dim !== "N/A") parts.push(`Dimensões: ${s.dim}`);
        return parts.join(" | ");
      }
    }))
  },
  {
    name: "Artilharia Civil",
    weapons: [
      { name: "Canudos", baseWeight: 0.25, weightStep: 0.025, prog: ["1d2 × 1","1d4 × 1","1d4 × 2","1d4 × 3","1d4 × 4","1d4 × 5","1d4 × 6","1d4 × 7","1d4 × 8","1d4 × 9","1d4 × 10"], stats: {"difficulty":"Destreza Vs 1d20","range":"Força ÷ 2","mult":1,"ammo":"Agulha","chamber":1,"mag":"Ø","fire":1,"rate":1,"area":"Alvo","load":"Ø Ações","dim":"1 x 20 x 1 cm"} },
      { name: "Bodoques", baseWeight: 0.25, weightStep: 0.025, prog: ["1d2","1d4","2d4","3d4","4d4","5d4","6d4","7d4","8d4","9d4","10d4"], stats: {"difficulty":"Destreza Vs 1d20","range":"Força ÷ 2","mult":1,"ammo":"Berlinde","chamber":1,"mag":"Ø","fire":1,"rate":1,"area":"Alvo","load":"Ø Ações","dim":"20 x 40 x 10 cm"} },
      { name: "Estilingues", baseWeight: 0.5, weightStep: 0.05, prog: ["1d3","1d6","2d6","3d6","4d6","5d6","6d6","7d6","8d6","9d6","10d6"], stats: {"difficulty":"Destreza Vs 1d20","range":"Força","mult":1,"ammo":"Berlinde","chamber":1,"mag":"Ø","fire":1,"rate":1,"area":"Alvo","load":"Ø Ações","dim":"25 x 50 x 15 cm"} },
      { name: "Zarabatanas", baseWeight: 0.5, weightStep: 0.05, prog: ["1d3 × 1","1d6 × 1","1d6 × 2","1d6 × 3","1d6 × 4","1d6 × 5","1d6 × 6","1d6 × 7","1d6 × 8","1d6 × 9","1d6 × 10"], stats: {"difficulty":"Destreza Vs 1d20","range":"Força","mult":1,"ammo":"Agulha","chamber":1,"mag":"Ø","fire":1,"rate":1,"area":"Alvo","load":"Ø Ações","dim":"2 x 40 x 2 cm"} }
    ].map(w => ({
      name: w.name,
      baseWeight: w.baseWeight,
      weightStep: w.weightStep,
      getBonus: (t: number, type: "metal" | "wood" | "crystal") => {
        const bonusType = type === "metal" ? "Físico" : type === "wood" ? "Mágico" : "Místico";
        const attackType = (w.stats as any).attackType || "Armado";
        const suffix = (w.stats as any).suffix || "";
        return `Ataque ${bonusType} ${attackType} + ${w.prog[t - 1] || w.prog[0]}${suffix}`;
      },
      getExtraStats: () => {
        const s = w.stats as any;
        let parts = [];
        if (s.difficulty) parts.push(`Dificuldade: ${s.difficulty}`);
        if (s.range) parts.push(`Alcance: ${s.range}`);
        if (s.mult) parts.push(`Multiplicador: ${s.mult}`);
        if (s.ammo) parts.push(`Munição: ${s.ammo}`);
        if (s.chamber) parts.push(`Câmara: ${s.chamber}`);
        if (s.mag) parts.push(`Carregador: ${s.mag}`);
        if (s.fire) parts.push(`Disparo: ${s.fire}`);
        if (s.rate) parts.push(`Cadência: ${s.rate}`);
        if (s.area) parts.push(`Área: ${s.area}`);
        if (s.load) parts.push(`Carregar: ${s.load}`);
        if (s.dim && s.dim !== "N/A") parts.push(`Dimensões: ${s.dim}`);
        return parts.join(" | ");
      }
    }))
  },
  {
    name: "Artilharia Marcial",
    weapons: [
      { name: "Fundas", baseWeight: 0.75, weightStep: 0.075, prog: ["1d4","1d8","2d8","3d8","4d8","5d8","6d8","7d8","8d8","9d8","10d8"], stats: {"difficulty":"Destreza Vs 1d20","range":"Força × 2","mult":1,"ammo":"Orbe","chamber":1,"mag":"Ø","fire":1,"rate":1,"area":"Alvo","load":"Ø Ações","dim":"5 x 120 x 1 cm"} },
      { name: "Fustíbalos", baseWeight: 1.5, weightStep: 0.15, prog: ["1d5","1d10","2d10","3d10","4d10","5d10","6d10","7d10","8d10","9d10","10d10"], stats: {"difficulty":"Destreza Vs 1d20","range":"Força × 5","mult":1,"ammo":"Orbe","chamber":1,"mag":"Ø","fire":1,"rate":1,"area":"Alvo","load":"Ø Ações","dim":"180 x 5 x 2 cm"} },
      { name: "Kotahas", baseWeight: 1.5, weightStep: 0.15, prog: ["1d5 × 1","1d10 × 1","1d10 × 2","1d10 × 3","1d10 × 4","1d10 × 5","1d10 × 6","1d10 × 7","1d10 × 8","1d10 × 9","1d10 × 10"], stats: {"difficulty":"Destreza Vs 1d20","range":"Força × 5","mult":1,"ammo":"Dardos","chamber":1,"mag":"Ø","fire":1,"rate":1,"area":"Alvo","load":"Ø Ações","dim":"10 x 80 x 5 cm"} },
      { name: "Norsaqs", baseWeight: 0.75, weightStep: 0.075, prog: ["1d4 × 1","1d8 × 1","1d8 × 2","1d8 × 3","1d8 × 4","1d8 × 5","1d8 × 6","1d8 × 7","1d8 × 8","1d8 × 9","1d8 × 10"], stats: {"difficulty":"Destreza Vs 1d20","range":"Força × 2","mult":1,"ammo":"Dardos","chamber":1,"mag":"Ø","fire":1,"rate":1,"area":"Alvo","load":"Ø Ações","dim":"5 x 40 x 2 cm"} }
    ].map(w => ({
      name: w.name,
      baseWeight: w.baseWeight,
      weightStep: w.weightStep,
      getBonus: (t: number, type: "metal" | "wood" | "crystal") => {
        const bonusType = type === "metal" ? "Físico" : type === "wood" ? "Mágico" : "Místico";
        const attackType = (w.stats as any).attackType || "Armado";
        const suffix = (w.stats as any).suffix || "";
        return `Ataque ${bonusType} ${attackType} + ${w.prog[t - 1] || w.prog[0]}${suffix}`;
      },
      getExtraStats: () => {
        const s = w.stats as any;
        let parts = [];
        if (s.difficulty) parts.push(`Dificuldade: ${s.difficulty}`);
        if (s.range) parts.push(`Alcance: ${s.range}`);
        if (s.mult) parts.push(`Multiplicador: ${s.mult}`);
        if (s.ammo) parts.push(`Munição: ${s.ammo}`);
        if (s.chamber) parts.push(`Câmara: ${s.chamber}`);
        if (s.mag) parts.push(`Carregador: ${s.mag}`);
        if (s.fire) parts.push(`Disparo: ${s.fire}`);
        if (s.rate) parts.push(`Cadência: ${s.rate}`);
        if (s.area) parts.push(`Área: ${s.area}`);
        if (s.load) parts.push(`Carregar: ${s.load}`);
        if (s.dim && s.dim !== "N/A") parts.push(`Dimensões: ${s.dim}`);
        return parts.join(" | ");
      }
    }))
  },
  {
    name: "Artilharia Militar",
    weapons: [
      { name: "Arbalestas", baseWeight: 5, weightStep: 0.5, prog: ["1d10","1d20","2d20","3d20","4d20","5d20","6d20","7d20","8d20","9d20","10d20"], stats: {"attackType":"Propulsivo","difficulty":"Destreza Vs 1d20","range":"Consciência × 25","mult":1,"ammo":"Virote","chamber":1,"mag":"Ø","fire":1,"rate":1,"area":"Alvo","load":"Ø Ações","dim":"80 x 50 x 10 cm"} },
      { name: "Arcos", baseWeight: 2.5, weightStep: 0.25, prog: ["1d6","1d12","2d12","3d12","4d12","5d12","6d12","7d12","8d12","9d12","10d12"], stats: {"attackType":"Armado","difficulty":"Destreza Vs 1d20","range":"Força × 10","mult":1,"ammo":"Flecha","chamber":1,"mag":"Ø","fire":1,"rate":1,"area":"Alvo","load":"Ø Ações","dim":"90 x 30 x 5 cm"} },
      { name: "Bestas", baseWeight: 2.5, weightStep: 0.25, prog: ["1d6","1d12","2d12","3d12","4d12","5d12","6d12","7d12","8d12","9d12","10d12"], stats: {"attackType":"Propulsivo","difficulty":"Destreza Vs 1d20","range":"Consciência × 10","mult":1,"ammo":"Virote","chamber":1,"mag":"Ø","fire":1,"rate":1,"area":"Alvo","load":"Ø Ações","dim":"60 x 40 x 5 cm"} },
      { name: "Yumis", baseWeight: 5, weightStep: 0.5, prog: ["1d10","1d20","2d20","3d20","4d20","5d20","6d20","7d20","8d20","9d20","10d20"], stats: {"attackType":"Armado","difficulty":"Destreza Vs 1d20","range":"Força × 25","mult":1,"ammo":"Flecha","chamber":1,"mag":"Ø","fire":1,"rate":1,"area":"Alvo","load":"Ø Ações","dim":"120 x 45 x 5 cm"} }
    ].map(w => ({
      name: w.name,
      baseWeight: w.baseWeight,
      weightStep: w.weightStep,
      getBonus: (t: number, type: "metal" | "wood" | "crystal") => {
        const bonusType = type === "metal" ? "Físico" : type === "wood" ? "Mágico" : "Místico";
        const attackType = (w.stats as any).attackType || "Armado";
        const suffix = (w.stats as any).suffix || "";
        return `Ataque ${bonusType} ${attackType} + ${w.prog[t - 1] || w.prog[0]}${suffix}`;
      },
      getExtraStats: () => {
        const s = w.stats as any;
        let parts = [];
        if (s.difficulty) parts.push(`Dificuldade: ${s.difficulty}`);
        if (s.range) parts.push(`Alcance: ${s.range}`);
        if (s.mult) parts.push(`Multiplicador: ${s.mult}`);
        if (s.ammo) parts.push(`Munição: ${s.ammo}`);
        if (s.chamber) parts.push(`Câmara: ${s.chamber}`);
        if (s.mag) parts.push(`Carregador: ${s.mag}`);
        if (s.fire) parts.push(`Disparo: ${s.fire}`);
        if (s.rate) parts.push(`Cadência: ${s.rate}`);
        if (s.area) parts.push(`Área: ${s.area}`);
        if (s.load) parts.push(`Carregar: ${s.load}`);
        if (s.dim && s.dim !== "N/A") parts.push(`Dimensões: ${s.dim}`);
        return parts.join(" | ");
      }
    }))
  },
  {
    name: "Armas de Fogo",
    weapons: [
      { name: "Garruchas", baseWeight: 1.5, weightStep: 0.15, prog: ["1d5","1d10","2d10","3d10","4d10","5d10","6d10","7d10","8d10","9d10","10d10"], stats: {"difficulty":"Destreza Vs 1d50","range":"Consciência","ammo":"Projétil Fundido (Carregado)","chamber":2,"mag":"Ø","fire":2,"rate":1,"area":"Alvo","load":"2 Ações","dim":"15 x 30 x 4 cm","attackType":"Propulsivo","suffix":" Por Projétil Disparado"} },
      { name: "Revólvers", baseWeight: 1.5, weightStep: 0.15, prog: ["1d5","1d10","2d10","3d10","4d10","5d10","6d10","7d10","8d10","9d10","10d10"], stats: {"difficulty":"Destreza Vs 1d20","range":"Consciência × 2","ammo":"Projétil Fundido (Carregado)","chamber":6,"mag":"Ø","fire":1,"rate":6,"area":"Alvo","load":"6 Ações","dim":"15 x 30 x 8 cm","attackType":"Propulsivo","suffix":" Por Projétil Disparado"} },
      { name: "Pistolas", baseWeight: 1.5, weightStep: 0.15, prog: ["1d5","1d10","2d10","3d10","4d10","5d10","6d10","7d10","8d10","9d10","10d10"], stats: {"difficulty":"Destreza Vs 1d20","range":"Consciência × 5","ammo":"Projétil Fundido (Carregado)","chamber":1,"mag":"18","fire":1,"rate":"18 + 1","area":"Alvo","load":"1 Ação","dim":"15 x 20 x 4 cm","attackType":"Propulsivo","suffix":" Por Projétil Disparado"} },
      { name: "Submetralhadoras", baseWeight: 1.5, weightStep: 0.15, prog: ["1d5","1d10","2d10","3d10","4d10","5d10","6d10","7d10","8d10","9d10","10d10"], stats: {"difficulty":"Destreza Vs 1d20","range":"Consciência × 10","ammo":"Projétil Fundido (Carregado)","chamber":1,"mag":"50","fire":1,"rate":"50 + 1","area":"Alvo","load":"1 Ação","dim":"20 x 50 x 5 cm","attackType":"Propulsivo","suffix":" Por Projétil Disparado"} },
      { name: "Bacamartes", baseWeight: 2.5, weightStep: 0.25, prog: ["1d5","1d10","2d10","3d10","4d10","5d10","6d10","7d10","8d10","9d10","10d10"], stats: {"difficulty":"Destreza Vs 1d20","range":"Ø","ammo":"Projétil Expansivo (Carregado)","chamber":1,"mag":"Ø","fire":1,"rate":1,"area":"Cone Equilátero De 2 Metros","load":"1 Ação","dim":"15 x 45 x 10 cm","attackType":"Propulsivo","suffix":" Por Projétil Disparado"} },
      { name: "Luparas", baseWeight: 2.5, weightStep: 0.25, prog: ["1d5","1d10","2d10","3d10","4d10","5d10","6d10","7d10","8d10","9d10","10d10"], stats: {"difficulty":"Destreza Vs 1d20","range":"Ø","ammo":"Projétil Expansivo (Carregado)","chamber":2,"mag":"Ø","fire":2,"rate":1,"area":"Cone Equilátero De 3 Metros","load":"2 Ações","dim":"15 x 50 x 5 cm","attackType":"Propulsivo","suffix":" Por Projétil Disparado"} },
      { name: "Espingardas", baseWeight: 2.5, weightStep: 0.25, prog: ["1d5","1d10","2d10","3d10","4d10","5d10","6d10","7d10","8d10","9d10","10d10"], stats: {"difficulty":"Destreza Vs 1d20","range":"Ø","ammo":"Projétil Expansivo (Carregado)","chamber":1,"mag":"4","fire":1,"rate":"4 + 1","area":"Cone Equilátero De 4 Metros","load":"1 Ação","dim":"15 x 120 x 15 cm","attackType":"Propulsivo","suffix":" Por Projétil Disparado"} },
      { name: "Escopetas", baseWeight: 2.5, weightStep: 0.25, prog: ["1d5","1d10","2d10","3d10","4d10","5d10","6d10","7d10","8d10","9d10","10d10"], stats: {"difficulty":"Destreza Vs 1d20","range":"Ø","ammo":"Projétil Expansivo (Carregado)","chamber":1,"mag":"8","fire":1,"rate":"8 + 1","area":"Cone Equilátero De 5 Metros","load":"1 Ação","dim":"25 x 100 x 15 cm","attackType":"Propulsivo","suffix":" Por Projétil Disparado"} },
      { name: "Mosquetes", baseWeight: 5, weightStep: 0.5, prog: ["1d5","1d10","2d10","3d10","4d10","5d10","6d10","7d10","8d10","9d10","10d10"], stats: {"difficulty":"Destreza Vs 1d20","range":"Consciência × 10","ammo":"Projétil Encamisado (Carregado)","chamber":1,"mag":"Ø","fire":1,"rate":1,"area":"Linha Reta De 2 Metros","load":"1 Ação","dim":"10 x 150 x 4 cm","attackType":"Propulsivo","suffix":" Por Projétil Disparado"} },
      { name: "Carabinas", baseWeight: 5, weightStep: 0.5, prog: ["1d5","1d10","2d10","3d10","4d10","5d10","6d10","7d10","8d10","9d10","10d10"], stats: {"difficulty":"Destreza Vs 1d20","range":"Consciência × 25","ammo":"Projétil Encamisado (Carregado)","chamber":1,"mag":"5","fire":1,"rate":"5 + 1","area":"Linha Reta De 5 Metros","load":"1 Ação","dim":"15 x 95 x 5 cm","attackType":"Propulsivo","suffix":" Por Projétil Disparado"} },
      { name: "Fuzis", baseWeight: 5, weightStep: 0.5, prog: ["1d5","1d10","2d10","3d10","4d10","5d10","6d10","7d10","8d10","9d10","10d10"], stats: {"difficulty":"Destreza Vs 1d20","range":"Consciência × 50","ammo":"Projétil Encamisado (Carregado)","chamber":1,"mag":"10","fire":1,"rate":"10 + 1","area":"Linha Reta De 10 Metros","load":"1 Ação","dim":"25 x 150 x 8 cm","attackType":"Propulsivo","suffix":" Por Projétil Disparado"} },
      { name: "Rifles", baseWeight: 5, weightStep: 0.5, prog: ["1d5","1d10","2d10","3d10","4d10","5d10","6d10","7d10","8d10","9d10","10d10"], stats: {"difficulty":"Destreza Vs 1d20","range":"Consciência × 100","ammo":"Projétil Encamisado (Carregado)","chamber":1,"mag":"20","fire":1,"rate":"20 + 1","area":"Linha Reta De 25 Metros","load":"1 Ação","dim":"25 x 145 x 10 cm","attackType":"Propulsivo","suffix":" Por Projétil Disparado"} }
    ].map(w => ({
      name: w.name,
      baseWeight: w.baseWeight,
      weightStep: w.weightStep,
      getBonus: (t: number, type: "metal" | "wood" | "crystal") => {
        const bonusType = type === "metal" ? "Físico" : type === "wood" ? "Mágico" : "Místico";
        const attackType = (w.stats as any).attackType || "Armado";
        const suffix = (w.stats as any).suffix || "";
        return `Ataque ${bonusType} ${attackType} + ${w.prog[t - 1] || w.prog[0]}${suffix}`;
      },
      getExtraStats: () => {
        const s = w.stats as any;
        let parts = [];
        if (s.difficulty) parts.push(`Dificuldade: ${s.difficulty}`);
        if (s.range) parts.push(`Alcance: ${s.range}`);
        if (s.mult) parts.push(`Multiplicador: ${s.mult}`);
        if (s.ammo) parts.push(`Munição: ${s.ammo}`);
        if (s.chamber) parts.push(`Câmara: ${s.chamber}`);
        if (s.mag) parts.push(`Carregador: ${s.mag}`);
        if (s.fire) parts.push(`Disparo: ${s.fire}`);
        if (s.rate) parts.push(`Cadência: ${s.rate}`);
        if (s.area) parts.push(`Área: ${s.area}`);
        if (s.load) parts.push(`Carregar: ${s.load}`);
        if (s.dim && s.dim !== "N/A") parts.push(`Dimensões: ${s.dim}`);
        return parts.join(" | ");
      }
    }))
  }

  ,{
    name: "Soqueiras",
    weapons: [
      { name: "Bagh Nakhs",  baseWeight: 0.5,  weightStep: 0.05,  attackType: "Desarmado", prog: ["1","2","4","6","8","10","12","14","16","18","20"] },
      { name: "Caestus",     baseWeight: 1.5,  weightStep: 0.15,  attackType: "Desarmado", prog: ["2","4","8","12","16","20","24","28","32","36","40"] },
      { name: "Himantes",    baseWeight: 0.75, weightStep: 0.075, attackType: "Desarmado", prog: ["1.5","3","6","9","12","15","18","21","24","27","30"] },
      { name: "Katars",      baseWeight: 5,    weightStep: 0.5,   attackType: "Desarmado", prog: ["3","6","12","18","24","30","36","42","48","54","60"] },
      { name: "Soqueiras",   baseWeight: 0.25, weightStep: 0.025, attackType: "Desarmado", prog: ["0.5","1","2","3","4","5","6","7","8","9","10"] },
      { name: "Tekko Kagis", baseWeight: 2.5,  weightStep: 0.25,  attackType: "Desarmado", prog: ["2.5","5","10","15","20","25","30","35","40","45","50"] },
    ].map((w) => ({
      name: w.name,
      baseWeight: w.baseWeight,
      weightStep: w.weightStep,
      getBonus: (t, type) => {
        const bonusType = type === "metal" ? "Físico" : type === "wood" ? "Mágico" : "Místico";
        return "Ataque " + bonusType + " Desarmado + " + (w.prog[t - 1] || w.prog[0]);
      },
      getExtraStats: () => ""
    }))
  }
];

const MATERIALS = [
  { tier: 1, metal: "Alumínio", wood: "Pinheiro", crystal: "Quartzo", rank: "Novato" },
  { tier: 2, metal: "Cobre", wood: "Sequoia", crystal: "Ónix", rank: "Novato" },
  { tier: 3, metal: "Ferro", wood: "Cedro", crystal: "Granada", rank: "Aprendiz" },
  { tier: 4, metal: "Níquel", wood: "Freixo", crystal: "Peridoto", rank: "Iniciado" },
  { tier: 5, metal: "Vanádio", wood: "Bétula", crystal: "Turmalina", rank: "Adepto" },
  { tier: 6, metal: "Titânio", wood: "Mogno", crystal: "Topázio", rank: "Veterano" },
  { tier: 7, metal: "Cromo", wood: "Carvalho", crystal: "Ametista", rank: "Expert" },
  { tier: 8, metal: "Cobalto", wood: "Ipê", crystal: "Esmeralda", rank: "Virtuoso" },
  { tier: 9, metal: "Irídio", wood: "Acácia", crystal: "Safira", rank: "Sábio" },
  { tier: 10, metal: "Rênio", wood: "Sândalo", crystal: "Rubi", rank: "Mestre" },
  { tier: 11, metal: "Volfrâmio", wood: "Ébano", crystal: "Diamante", rank: "Grão Mestre" },
];

const LEATHER_MATERIALS = [
  "Peles",
  "Animal Bestial",
  "Animal Humanoide",
  "Monstro Bestial",
  "Monstro Humanoide",
  "Elemental Material",
  "Elemental Energético",
  "Aberração Bestial",
  "Aberração Humanoide",
  "Criatura Bestial",
  "Criatura Humanoide"
];

const ARMOR_TYPES = [
  { type: 'Leve', layer: 'Interna', baseWeight: 0.5, weightStep: 0.05, defenseType: 'Física, Mágica & Mística' },
  { type: 'Média', layer: 'Central', baseWeight: 1.0, weightStep: 0.1, defenseType: 'Variável' },
  { type: 'Pesada', layer: 'Externa', baseWeight: 2.0, weightStep: 0.2, defenseType: 'Variável' }
];

const ARMOR_PARTS = [
  { part: 'Cabeça', name: 'Elmo' },
  { part: 'Pescoço', name: 'Gorjal' },
  { part: 'Tronco', name: 'Couraça' },
  { part: 'Ombro', name: 'Ombreira' },
  { part: 'Braço', name: 'Braçadeira' },
  { part: 'Cotovelo', name: 'Codal' },
  { part: 'Antebraço', name: 'Avambraço' },
  { part: 'Mão', name: 'Guante' },
  { part: 'Coxa', name: 'Quixote' },
  { part: 'Joelho', name: 'Joelheira' },
  { part: 'Perna', name: 'Greva' },
  { part: 'Pé', name: 'Bota' }
];

const SECONDARY_BONUS_PROG = [2, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50];

const SHIELD_TYPES = [
  {
    name: "Broquel",
    defenseProg: [2, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50],
    secondaryLabel: "Revide",
    baseWeightKg: 5,
    weightStepKg: 0.5,
    dimensions: "40×25×1 cm",
  },
  {
    name: "Pipa",
    defenseProg: [5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    secondaryLabel: "Bloqueio",
    baseWeightKg: 10,
    weightStepKg: 1,
    dimensions: "80×50×2 cm",
  },
  {
    name: "Torre",
    defenseProg: [10, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200],
    secondaryLabel: "Absorção",
    baseWeightKg: 20,
    weightStepKg: 2,
    dimensions: "160×100×4 cm",
  },
];

const AMMO_TYPES = [
  { name: "Agulhas",             attackType: "Propulsivo", baseWeightKg: 0.025, weightStepKg: 0.0025, dimensions: "4×4×2 cm",  craft: "Artilharia Civil" },
  { name: "Berlindes",           attackType: "Armado",    baseWeightKg: 0.010, weightStepKg: 0.001,  dimensions: "1×1×1 cm",  craft: "Artilharia Civil" },
  { name: "Dardos",              attackType: "Armado",    baseWeightKg: 0.025, weightStepKg: 0.0025, dimensions: "2×10×2 cm", craft: "Arremesso" },
  { name: "Flechas",             attackType: "Armado",    baseWeightKg: 0.050, weightStepKg: 0.005,  dimensions: "50×1×1 cm", craft: "Artilharia Militar" },
  { name: "Orbes",               attackType: "Armado",    baseWeightKg: 0.025, weightStepKg: 0.0025, dimensions: "5×5×5 cm",  craft: "Artilharia Marcial" },
  { name: "Virotes",             attackType: "Armado",    baseWeightKg: 0.050, weightStepKg: 0.005,  dimensions: "25×2×2 cm", craft: "Artilharia Militar" },
  { name: "Projéteis Fundidos",  attackType: "Propulsivo", baseWeightKg: 0.010, weightStepKg: 0.001,  dimensions: "2×2×2 cm",  craft: "Armas de Fogo" },
  { name: "Projéteis Expansivos",attackType: "Propulsivo", baseWeightKg: 0.025, weightStepKg: 0.0025, dimensions: "4×4×2 cm",  craft: "Armas de Fogo" },
  { name: "Projéteis Encamisados",attackType:"Propulsivo", baseWeightKg: 0.050, weightStepKg: 0.005,  dimensions: "4×4×4 cm",  craft: "Armas de Fogo" },
];

const GEM_RANKS = ['F', 'E', 'D', 'C', 'B', 'A', 'S', '☆', '☆☆', '☆☆☆'];
const GEM_CATEGORIES = [
  { name: 'Ampliadoras (Atributos)', prefix: '', subTypes: ['Carisma', 'Consciência', 'Constituição', 'Destreza', 'Força', 'Inteligência', 'Intuição', 'Sorte', 'Vontade'], vals: [1,2,3,4,5,6,7,8,9,10], runas: [0,1,1,2,2,3,3,4,4,5] },
  { name: 'Ampliadoras (Derivados)', prefix: '', subTypes: ['Vitalidade', 'Introspecção', 'Destino'], vals: [2,5,7,10,12,15,17,20,22,25], runas: [0,1,1,2,2,3,3,4,4,5] },
  { name: 'Ampliadoras (Status)', prefix: '', subTypes: ['Estômago', 'Fígado', 'Estudo', 'Prática', 'Treino', 'Extrapolar'], vals: [1,2,3,4,5,6,7,8,9,10], runas: [0,1,1,2,2,3,3,4,4,5] },
  { name: 'Dominantes', prefix: 'Redutor ', subTypes: ['Físico', 'Mágico', 'Místico'], vals: [2,5,7,10,12,15,17,20,22,25], runas: [0,1,1,2,2,3,3,4,4,5] },
  { name: 'Agressoras', prefix: 'Ataques ', subTypes: ['Físicos', 'Mágicos', 'Místicos'], vals: [2,5,7,10,12,15,17,20,22,25], runas: [0,1,1,2,2,3,3,4,4,5] },
  { name: 'Indutoras', prefix: 'Regeneração ', subTypes: ['Vital', 'Sânica', 'Física', 'Mágica', 'Mística'], vals: [5,10,15,20,25,30,35,40,45,50], runas: [0,1,1,2,2,3,3,4,4,5] },
  { name: 'Protetoras', prefix: 'Defesa ', subTypes: ['Física', 'Mágica', 'Mental', 'Universal'], vals: [2,5,7,10,12,15,17,20,22,25], runas: [0,1,1,2,2,3,3,4,4,5] },
  { name: 'Tanque', prefix: '', subTypes: ['Vida', 'Sanidade', 'Vigor', 'Mana', 'Poder'], vals: [5,10,15,20,25,30,35,40,45,50], runas: [0,1,1,2,2,3,3,4,4,5] },
];

const ACCESSORY_METALS = [
  { name: "Latão", runas: 1, maxGem: "E" },
  { name: "Bronze", runas: 2, maxGem: "C" },
  { name: "Prata", runas: 3, maxGem: "A" },
  { name: "Ouro", runas: 4, maxGem: "☆" },
  { name: "Platina", runas: 5, maxGem: "☆☆☆" },
];

const ACCESSORY_TYPES = [
  { name: 'Tiara', slot: 'Cabeça', gemsAmt: 3, weightKg: 0.25 },
  { name: 'Coroa', slot: 'Cabeça', gemsAmt: 5, weightKg: 0.5 },
  { name: 'Colar', slot: 'Garganta', gemsAmt: 1, weightKg: 0.05 },
  { name: 'Brinco', slot: 'Ouvido', gemsAmt: 1, weightKg: 0.025 },
  { name: 'Bracelete', slot: 'Antebraço', gemsAmt: 3, weightKg: 0.25 },
  { name: 'Manopla', slot: 'Mão', gemsAmt: 5, weightKg: 0.5 },
  { name: 'Pulseira', slot: 'Pulso', gemsAmt: 1, weightKg: 0.1 },
  { name: 'Anel', slot: 'Dedo', gemsAmt: 1, weightKg: 0.025 },
  { name: 'Cinturão', slot: 'Cintura', gemsAmt: 10, weightKg: 2 },
  { name: 'Tornozeleira', slot: 'Tornozelo', gemsAmt: 1, weightKg: 0.1 },
];

const BAG_MATERIALS = [
  { name: "Sintético", capacityKg: 2.5, runas: 0 },
  { name: "Animal Bestial", capacityKg: 5, runas: 0 },
  { name: "Animal Humanoide", capacityKg: 10, runas: 1 },
  { name: "Monstro Bestial", capacityKg: 15, runas: 1 },
  { name: "Monstro Humanoide", capacityKg: 20, runas: 2 },
  { name: "Elemental Material", capacityKg: 25, runas: 2 },
  { name: "Elemental Energético", capacityKg: 30, runas: 3 },
  { name: "Aberração Bestial", capacityKg: 35, runas: 3 },
  { name: "Aberração Humanoide", capacityKg: 40, runas: 4 },
  { name: "Criatura Bestial", capacityKg: 45, runas: 4 },
  { name: "Criatura Humanoide", capacityKg: 50, runas: 5 },
];

const BAG_SIZES = [
  { name: "Pequena", baseWeightKg: 0.5 },
  { name: "Média", baseWeightKg: 1 },
  { name: "Grande", baseWeightKg: 2.5 },
];

export function ItemCatalog({ onClose, onAddItem }: ItemCatalogProps) {
  const [tab, setTab] = useState<'weapons' | 'armors' | 'ammo' | 'shields' | 'gems' | 'accessories' | 'bags' | 'runas'>('weapons');
  
  // Weapon State
  const [selectedWeaponCategoryIdx, setSelectedWeaponCategoryIdx] = useState(0);
  const [selectedWeaponIdx, setSelectedWeaponIdx] = useState(0);
  const [selectedMaterialTier, setSelectedMaterialTier] = useState(1);
  const [selectedMaterialType, setSelectedMaterialType] = useState<'metal' | 'wood' | 'crystal'>('metal');

  // Armor State
  const [selectedArmorTypeIdx, setSelectedArmorTypeIdx] = useState(0);
  const [selectedArmorPartIndices, setSelectedArmorPartIndices] = useState<number[]>([0]);
  const [selectedArmorTier, setSelectedArmorTier] = useState(1);
  const [selectedArmorMaterialType, setSelectedArmorMaterialType] = useState<'leather' | 'metal' | 'wood' | 'crystal'>('metal');

  // Ammo State
  const [selectedAmmoTypeIdx, setSelectedAmmoTypeIdx] = useState(0);
  const [selectedAmmoMaterialType, setSelectedAmmoMaterialType] = useState<'metal' | 'wood' | 'crystal'>('metal');
  const [selectedAmmoTier, setSelectedAmmoTier] = useState(1);
  const [ammoQuantity, setAmmoQuantity] = useState(10);

  // Shield State
  const [selectedShieldTypeIdx, setSelectedShieldTypeIdx] = useState(0);
  const [selectedShieldMaterialType, setSelectedShieldMaterialType] = useState<'metal' | 'wood' | 'crystal'>('metal');
  const [selectedShieldTier, setSelectedShieldTier] = useState(1);

  // Gemas State
  const [selectedGemCategoryIdx, setSelectedGemCategoryIdx] = useState(0);
  const [selectedGemRankIdx, setSelectedGemRankIdx] = useState(0);
  const [selectedGemSubTypeIdx, setSelectedGemSubTypeIdx] = useState(0);

  // Acessórios State
  const [selectedAccessoryTypeIdx, setSelectedAccessoryTypeIdx] = useState(0);
  const [selectedAccessoryMetalIdx, setSelectedAccessoryMetalIdx] = useState(0);

  // Bolsas State
  const [selectedBagSizeIdx, setSelectedBagSizeIdx] = useState(0);
  const [selectedBagMaterialIdx, setSelectedBagMaterialIdx] = useState(0);

  // Runas State
  const uniqueRuneNames = Array.from(new Set(RUNE_CATALOG.map(e => `${e.baseName}||${e.anchor}`)));
  const [selectedRuneEntryKey, setSelectedRuneEntryKey] = useState(uniqueRuneNames[0]);
  const [selectedRunePotenciaIdx, setSelectedRunePotenciaIdx] = useState(0);

  const selectedRuneEntry: RuneCatalogEntry | undefined = (() => {
    const [baseName, anchor] = selectedRuneEntryKey.split('||');
    return RUNE_CATALOG.find(e => e.baseName === baseName && e.anchor === anchor);
  })();

  const handleAddRune = () => {
    if (!selectedRuneEntry) return;
    const effect = selectedRuneEntry.getPotenciaEffect(selectedRunePotenciaIdx);
    const potenciaName = RUNE_POTENCIAS[selectedRunePotenciaIdx];
    const colors = RUNE_COLOR_CLASSES[selectedRuneEntry.color];
    const displayName = `${selectedRuneEntry.baseName} (${selectedRuneEntry.anchor}) — ${potenciaName}`;
    setCart(prev => [...prev, {
      name: displayName,
      category: 'Runas',
      weight: 0,
      quantity: 1,
      description: effect.description,
      runeEffect: effect,
      runeAnchor: selectedRuneEntry.anchor,
      runePotenciaIndex: selectedRunePotenciaIdx,
      runePotenciaName: potenciaName,
    } as Omit<InventoryItem, 'id'>]);
    showSuccessToast();
  };

  // Cart State
  const [cart, setCart] = useState<Omit<InventoryItem, 'id'>[]>([]);
  const [showToast, setShowToast] = useState(false);

  const showSuccessToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleAddGem = () => {
    const category = GEM_CATEGORIES[selectedGemCategoryIdx];
    const rank = GEM_RANKS[selectedGemRankIdx];
    const runas = category.runas[selectedGemRankIdx];
    const val = category.vals[selectedGemRankIdx];
    const safeSubTypeIdx = Math.min(selectedGemSubTypeIdx, category.subTypes.length - 1);
    const subType = category.subTypes[safeSubTypeIdx];
    
    setCart(prev => [...prev, {
      name: `Gema ${category.name.split(' ')[0]} - ${subType} (${rank})`,
      category: 'Gemas',
      weight: 0.01,
      quantity: 1,
      description: `Tipo: ${category.name} | Potencial: ${runas} Runas | Bônus: ${category.prefix}${subType} +${val}`,
      requiredTier: selectedGemRankIdx,
      gemEffect: {
        category: category.name,
        target: subType,
        value: val,
        runas: runas,
        prefix: category.prefix
      }
    }]);
    showSuccessToast();
  };

  const handleAddAccessory = () => {
    const accType = ACCESSORY_TYPES[selectedAccessoryTypeIdx];
    const metal = ACCESSORY_METALS[selectedAccessoryMetalIdx];
    
    setCart(prev => [...prev, {
      name: `${accType.name} de ${metal.name}`,
      category: 'Acessórios',
      weight: accType.weightKg,
      quantity: 1,
      description: `Espaço: ${accType.slot} | Potencial Mínimo: ${metal.runas} Runa(s) | Capacidade: ${accType.gemsAmt} Gema(s) até Ranque ${metal.maxGem}`,
      requiredTier: selectedAccessoryMetalIdx,
      accessorySlot: accType.slot as any,
      gemCapacity: accType.gemsAmt,
      maxGemTier: metal.maxGem,
      socketedGemIds: []
    }]);
    showSuccessToast();
  };

  const handleAddBag = () => {
    const size = BAG_SIZES[selectedBagSizeIdx];
    const material = BAG_MATERIALS[selectedBagMaterialIdx];
    const weight = Number((size.baseWeightKg * (1 + 0.1 * selectedBagMaterialIdx)).toFixed(2));
    
    setCart(prev => [...prev, {
      name: `Bolsa ${size.name} de ${material.name}`,
      category: 'Bolsas',
      weight: weight,
      quantity: 1,
      description: `Carga Suportada: +${material.capacityKg} kg | Potencial: ${material.runas} Runa(s)`,
      requiredTier: selectedBagMaterialIdx
    }]);
    showSuccessToast();
  };

  const handleAddWeapon = () => {
    const category = WEAPON_CATEGORIES[selectedWeaponCategoryIdx];
    const weapon = category.weapons[selectedWeaponIdx];
    const material = MATERIALS[selectedMaterialTier - 1][selectedMaterialType];
    const weight = Number((weapon.baseWeight + (weapon.weightStep * (selectedMaterialTier - 1))).toFixed(2));
    const bonus = weapon.getBonus(selectedMaterialTier, selectedMaterialType);
    const extraStats = typeof weapon.getExtraStats !== 'undefined' ? weapon.getExtraStats() : "";
    
    setCart(prev => [...prev, {
      name: `${weapon.name} de ${material}`,
      category: "Armas",
      weight,
      quantity: 1,
      description: `Aptidão: ${category.name} | Ranque: ${MATERIALS[selectedMaterialTier - 1].rank} | ${bonus} | ${extraStats}`,
      requiredAptitude: category.name,
      requiredTier: selectedMaterialTier - 1
    }]);
    showSuccessToast();
  };

  const handleAddArmor = () => {
    const armorType = ARMOR_TYPES[selectedArmorTypeIdx];
    const weight = Number((armorType.baseWeight + (armorType.weightStep * (selectedArmorTier - 1))).toFixed(2));
    
    let defense = 0;
    let defenseTypeStr = "";
    let materialName = "";

    if (armorType.type === 'Leve') {
      defense = selectedArmorTier === 1 ? 0.5 : selectedArmorTier - 1;
      defenseTypeStr = "Física, Mágica & Mística";
      materialName = LEATHER_MATERIALS[selectedArmorTier - 1];
    } else {
      if (armorType.type === 'Média') {
        defense = selectedArmorTier === 1 ? 1 : (selectedArmorTier - 1) * 2;
      } else {
        defense = selectedArmorTier === 1 ? 2 : (selectedArmorTier - 1) * 4;
      }
      
      const matType = selectedArmorMaterialType === 'leather' ? 'metal' : selectedArmorMaterialType;
      materialName = MATERIALS[selectedArmorTier - 1][matType];
      defenseTypeStr = matType === 'metal' ? 'Física' : matType === 'wood' ? 'Mágica' : 'Mística';
    }
    
    const newItems: Omit<InventoryItem, 'id'>[] = selectedArmorPartIndices.map(idx => {
      const armorPart = ARMOR_PARTS[idx];
      return {
        name: `${armorPart.name} de ${materialName}`,
        category: "Armaduras",
        weight: weight,
        quantity: 1,
        description: `Camada: ${armorType.layer} | Espaço: ${armorPart.part} | Defesa ${defenseTypeStr}: +${defense}`,
        armorPart: armorPart.part as any,
        armorLayer: armorType.layer as any,
        requiredAptitude: `Armadura ${armorType.type}`,
        requiredTier: selectedArmorTier - 1
      };
    });
    setCart(prev => [...prev, ...newItems]);
    showSuccessToast();
  };

  const handleAddArmorKit = () => {
    const armorType = ARMOR_TYPES[selectedArmorTypeIdx];
    const weight = Number((armorType.baseWeight + (armorType.weightStep * (selectedArmorTier - 1))).toFixed(2));
    
    let defense = 0;
    let defenseTypeStr = "";
    let materialName = "";

    if (armorType.type === 'Leve') {
      defense = selectedArmorTier === 1 ? 0.5 : selectedArmorTier - 1;
      defenseTypeStr = "Física, Mágica & Mística";
      materialName = LEATHER_MATERIALS[selectedArmorTier - 1];
    } else {
      if (armorType.type === 'Média') {
        defense = selectedArmorTier === 1 ? 1 : (selectedArmorTier - 1) * 2;
      } else {
        defense = selectedArmorTier === 1 ? 2 : (selectedArmorTier - 1) * 4;
      }
      
      const matType = selectedArmorMaterialType === 'leather' ? 'metal' : selectedArmorMaterialType;
      materialName = MATERIALS[selectedArmorTier - 1][matType];
      defenseTypeStr = matType === 'metal' ? 'Física' : matType === 'wood' ? 'Mágica' : 'Mística';
    }

    const newItems: Omit<InventoryItem, 'id'>[] = ARMOR_PARTS.map(part => {
      return {
        name: `${part.name} de ${materialName}`,
        category: "Armaduras",
        weight: weight,
        quantity: 1,
        description: `Camada: ${armorType.layer} | Espaço: ${part.part} | Defesa ${defenseTypeStr}: +${defense}`,
        armorPart: part.part as any,
        armorLayer: armorType.layer as any,
        requiredAptitude: `Armadura ${armorType.type}`,
        requiredTier: selectedArmorTier - 1
      };
    });
    setCart(prev => [...prev, ...newItems]);
    showSuccessToast();
  };

  const handleAddShield = () => {
    const shield = SHIELD_TYPES[selectedShieldTypeIdx];
    const material = MATERIALS[selectedShieldTier - 1][selectedShieldMaterialType];
    const defenseType = selectedShieldMaterialType === 'metal' ? 'Física' : selectedShieldMaterialType === 'wood' ? 'Mágica' : 'Mística';
    const defenseVal = shield.defenseProg[selectedShieldTier - 1];
    const secondaryVal = SECONDARY_BONUS_PROG[selectedShieldTier - 1];
    const secondaryLabel = shield.secondaryLabel === 'Absorção' ? `Absorção ${defenseType}` : shield.secondaryLabel;
    const weight = Number((shield.baseWeightKg + shield.weightStepKg * (selectedShieldTier - 1)).toFixed(2));
    const rank = MATERIALS[selectedShieldTier - 1].rank;
    setCart(prev => [...prev, {
      name: `Escudo ${shield.name} de ${material}`,
      category: 'Escudos',
      weight,
      quantity: 1,
      description: `Aptidão: Escuderia ${rank} | Defesa ${defenseType}: +${defenseVal} | ${secondaryLabel}: +${secondaryVal}% | Dimensões: ${shield.dimensions}`,
      requiredAptitude: "Escuderia",
      requiredTier: selectedShieldTier - 1
    }]);
    showSuccessToast();
  };

  const handleAddAmmo = () => {
    const ammo = AMMO_TYPES[selectedAmmoTypeIdx];
    const material = MATERIALS[selectedAmmoTier - 1][selectedAmmoMaterialType];
    const bonusType = selectedAmmoMaterialType === 'metal' ? 'Físico' : selectedAmmoMaterialType === 'wood' ? 'Mágico' : 'Místico';
    const bonus = selectedAmmoTier === 1 ? 'Sem bônus' : `Ataque ${bonusType} ${ammo.attackType} + ${selectedAmmoTier - 1}`;
    const weightPerUnit = Number((ammo.baseWeightKg + ammo.weightStepKg * (selectedAmmoTier - 1)).toFixed(4));
    const totalWeight = Number((weightPerUnit * ammoQuantity).toFixed(4));
    const rank = MATERIALS[selectedAmmoTier - 1].rank;
    setCart(prev => [...prev, {
      name: `${ammo.name} de ${material} (×${ammoQuantity})`,
      category: 'Munições',
      weight: totalWeight,
      quantity: 1,
      description: `Tipo: ${ammo.name} | Ranque: ${rank} | ${bonus} | Dimensões: ${ammo.dimensions} | ${ammoQuantity} unid. × ${(weightPerUnit * 1000).toFixed(1)}g`,
      requiredTier: selectedAmmoTier - 1
      // Ammo usually doesn't have an aptitude check, but we set tier just in case
    }]);
    showSuccessToast();
  };

  const handleCheckout = () => {
    cart.forEach(item => onAddItem(item));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-3xl border border-slate-700 w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Plus className="text-indigo-400" />
            Catálogo de Itens
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700 bg-slate-900/30 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setTab('weapons')}
            className={`flex-1 py-4 font-medium flex items-center justify-center gap-2 transition-colors ${tab === 'weapons' ? 'text-amber-400 border-b-2 border-amber-400 bg-amber-400/5' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
          >
            <Sword size={18} /> Armas
          </button>
          <button
            onClick={() => setTab('armors')}
            className={`flex-1 py-4 font-medium flex items-center justify-center gap-2 transition-colors ${tab === 'armors' ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-400/5' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
          >
            <Shield size={18} /> Armaduras
          </button>
          <button
            onClick={() => setTab('ammo')}
            className={`flex-1 py-4 font-medium flex items-center justify-center gap-2 transition-colors ${tab === 'ammo' ? 'text-orange-400 border-b-2 border-orange-400 bg-orange-400/5' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
          >
            <Zap size={18} /> Munições
          </button>
          <button
            onClick={() => setTab('shields')}
            className={`flex-1 min-w-[120px] py-4 font-medium flex items-center justify-center gap-2 transition-colors ${tab === 'shields' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-400/5' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
          >
            <ShieldCheck size={18} /> Escudos
          </button>
          <button
            onClick={() => setTab('accessories')}
            className={`flex-1 min-w-[120px] py-4 font-medium flex items-center justify-center gap-2 transition-colors ${tab === 'accessories' ? 'text-pink-400 border-b-2 border-pink-400 bg-pink-400/5' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
          >
            <Crown size={18} /> Acessórios
          </button>
          <button
            onClick={() => setTab('gems')}
            className={`flex-1 min-w-[120px] py-4 font-medium flex items-center justify-center gap-2 transition-colors ${tab === 'gems' ? 'text-fuchsia-400 border-b-2 border-fuchsia-400 bg-fuchsia-400/5' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
          >
            <Gem size={18} /> Gemas
          </button>
          <button
            onClick={() => setTab('bags')}
            className={`flex-1 min-w-[120px] py-4 font-medium flex items-center justify-center gap-2 transition-colors ${tab === 'bags' ? 'text-lime-400 border-b-2 border-lime-400 bg-lime-400/5' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
          >
            <Backpack size={18} /> Bolsas
          </button>
          <button
            onClick={() => setTab('runas')}
            className={`flex-1 min-w-[120px] py-4 font-medium flex items-center justify-center gap-2 transition-colors ${tab === 'runas' ? 'text-violet-400 border-b-2 border-violet-400 bg-violet-400/5' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
          >
            <span className="text-lg leading-none">ᚱ</span> Runas
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {tab === 'ammo' ? (
            <div className="space-y-6">
              {/* Ammo Type Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Tipo de Munição</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {AMMO_TYPES.map((a, idx) => (
                    <button
                      key={a.name}
                      onClick={() => setSelectedAmmoTypeIdx(idx)}
                      className={`p-2.5 rounded-xl text-sm border transition-all flex flex-col items-center gap-1 ${
                        selectedAmmoTypeIdx === idx
                          ? 'bg-orange-500/20 border-orange-500 text-orange-300'
                          : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      <span className="font-semibold text-center">{a.name}</span>
                      <span className="text-[10px] opacity-60">{a.attackType}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Material Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Categoria do Material</label>
                  <div className="flex gap-2">
                    <button onClick={() => setSelectedAmmoMaterialType('metal')} className={`flex-1 py-2 rounded-xl text-sm border transition-all ${selectedAmmoMaterialType === 'metal' ? 'bg-slate-700 border-slate-400 text-white' : 'bg-slate-900/50 border-slate-700 text-slate-400'}`}>Metal</button>
                    <button onClick={() => setSelectedAmmoMaterialType('wood')}  className={`flex-1 py-2 rounded-xl text-sm border transition-all ${selectedAmmoMaterialType === 'wood'  ? 'bg-amber-900/50 border-amber-700 text-amber-200' : 'bg-slate-900/50 border-slate-700 text-slate-400'}`}>Madeira</button>
                    <button onClick={() => setSelectedAmmoMaterialType('crystal')} className={`flex-1 py-2 rounded-xl text-sm border transition-all ${selectedAmmoMaterialType === 'crystal' ? 'bg-purple-900/50 border-purple-500 text-purple-200' : 'bg-slate-900/50 border-slate-700 text-slate-400'}`}>Cristal</button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Nível do Material (1 a 11)</label>
                  <input
                    type="range" min="1" max="11"
                    value={selectedAmmoTier}
                    onChange={e => setSelectedAmmoTier(Number(e.target.value))}
                    className="w-full accent-orange-500"
                  />
                  <div className="text-center mt-2 font-medium text-orange-400">
                    Nível {selectedAmmoTier}: {MATERIALS[selectedAmmoTier - 1][selectedAmmoMaterialType]}
                  </div>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Quantidade de Unidades</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range" min="1" max="100"
                    value={ammoQuantity}
                    onChange={e => setAmmoQuantity(Number(e.target.value))}
                    className="flex-1 accent-orange-500"
                  />
                  <input
                    type="number" min="1" max="9999"
                    value={ammoQuantity}
                    onChange={e => setAmmoQuantity(Math.max(1, Number(e.target.value)))}
                    className="w-20 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-orange-500 text-center"
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Pré-visualização</h3>
                {(() => {
                  const ammo = AMMO_TYPES[selectedAmmoTypeIdx];
                  const material = MATERIALS[selectedAmmoTier - 1][selectedAmmoMaterialType];
                  const bonusType = selectedAmmoMaterialType === 'metal' ? 'Físico' : selectedAmmoMaterialType === 'wood' ? 'Mágico' : 'Místico';
                  const bonus = selectedAmmoTier === 1 ? 'Sem bônus' : `Ataque ${bonusType} ${ammo.attackType} + ${selectedAmmoTier - 1}`;
                  const weightPerUnit = Number((ammo.baseWeightKg + ammo.weightStepKg * (selectedAmmoTier - 1)).toFixed(4));
                  const totalWeight = Number((weightPerUnit * ammoQuantity).toFixed(3));
                  return (
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="text-lg font-bold text-white">{ammo.name} de {material} ×{ammoQuantity}</div>
                        <div className="text-sm text-orange-400 mt-1">Ranque: {MATERIALS[selectedAmmoTier - 1].rank} | {bonus}</div>
                        <div className="text-[11px] text-slate-500 mt-1">Dimensões: {ammo.dimensions} | {(weightPerUnit * 1000).toFixed(1)}g / unid.</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs text-slate-400">Peso Total</div>
                        <div className="text-lg font-mono text-slate-200">{totalWeight.toFixed(3)} kg</div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <button
                onClick={handleAddAmmo}
                className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={20} /> Adicionar {ammoQuantity} {AMMO_TYPES[selectedAmmoTypeIdx].name} ao Carrinho
              </button>
            </div>
          ) : tab === 'weapons' ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Categoria de Aptidão</label>
                <div className="flex flex-wrap gap-2">
                  {WEAPON_CATEGORIES.map((cat, idx) => (
                    <button
                      key={cat.name}
                      onClick={() => {
                        setSelectedWeaponCategoryIdx(idx);
                        setSelectedWeaponIdx(0);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${selectedWeaponCategoryIdx === idx ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Tipo de Arma</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {WEAPON_CATEGORIES[selectedWeaponCategoryIdx].weapons.map((w, idx) => (
                    <button
                      key={w.name}
                      onClick={() => setSelectedWeaponIdx(idx)}
                      className={`p-2 rounded-xl text-sm border transition-all flex flex-col items-center gap-1.5 ${selectedWeaponIdx === idx ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                    >
                      <span className="font-semibold">{w.name}</span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 11 }).map((_, i) => {
                          const TIER_COLORS = [
                            'bg-slate-500', 'bg-slate-400', 'bg-emerald-500', 'bg-emerald-400', 
                            'bg-blue-500', 'bg-blue-400', 'bg-purple-500', 'bg-purple-400', 
                            'bg-amber-500', 'bg-orange-500', 'bg-red-500'
                          ];
                          const isCurrentTier = (i + 1) === selectedMaterialTier;
                          const colorClass = TIER_COLORS[i];
                          const damageStr = w.getBonus(i + 1, 'metal').replace('Ataque Físico Armado + ', '');
                          
                          return (
                            <div 
                              key={i} 
                              className={`w-1.5 h-1.5 rounded-full transition-all ${colorClass} ${isCurrentTier ? 'scale-150 ring-1 ring-white/50' : 'opacity-40 hover:opacity-100'}`} 
                              title={`Nível ${i + 1}: ${damageStr}`}
                            />
                          );
                        })}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Categoria do Material</label>
                  <div className="flex gap-2">
                    <button onClick={() => setSelectedMaterialType('metal')} className={`flex-1 py-2 rounded-xl text-sm border transition-all ${selectedMaterialType === 'metal' ? 'bg-slate-700 border-slate-400 text-white' : 'bg-slate-900/50 border-slate-700 text-slate-400'}`}>Metal</button>
                    <button onClick={() => setSelectedMaterialType('wood')} className={`flex-1 py-2 rounded-xl text-sm border transition-all ${selectedMaterialType === 'wood' ? 'bg-amber-900/50 border-amber-700 text-amber-200' : 'bg-slate-900/50 border-slate-700 text-slate-400'}`}>Madeira</button>
                    <button onClick={() => setSelectedMaterialType('crystal')} className={`flex-1 py-2 rounded-xl text-sm border transition-all ${selectedMaterialType === 'crystal' ? 'bg-purple-900/50 border-purple-500 text-purple-200' : 'bg-slate-900/50 border-slate-700 text-slate-400'}`}>Cristal</button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Nível do Material (1 a 11)</label>
                  <input 
                    type="range" 
                    min="1" 
                    max="11" 
                    value={selectedMaterialTier} 
                    onChange={(e) => setSelectedMaterialTier(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                  <div className="text-center mt-2 font-medium text-amber-400">
                    Nível {selectedMaterialTier}: {MATERIALS[selectedMaterialTier - 1][selectedMaterialType]}
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Pré-visualização</h3>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-lg font-bold text-white">
                      {WEAPON_CATEGORIES[selectedWeaponCategoryIdx].weapons[selectedWeaponIdx].name} de {MATERIALS[selectedMaterialTier - 1][selectedMaterialType]}
                    </div>
                    <div className="text-sm text-amber-400 mt-1">
                      Aptidão: {WEAPON_CATEGORIES[selectedWeaponCategoryIdx].name} | Ranque: {MATERIALS[selectedMaterialTier - 1].rank}
                    </div>
                    <div className="text-sm text-slate-300 mt-1">
                      {WEAPON_CATEGORIES[selectedWeaponCategoryIdx].weapons[selectedWeaponIdx].getBonus(selectedMaterialTier, selectedMaterialType)}
                    </div>
                    {WEAPON_CATEGORIES[selectedWeaponCategoryIdx].weapons[selectedWeaponIdx].getExtraStats && WEAPON_CATEGORIES[selectedWeaponCategoryIdx].weapons[selectedWeaponIdx].getExtraStats() && (
                      <div className="text-[10px] leading-tight text-slate-500 mt-2 flex flex-col gap-0.5">
                        {WEAPON_CATEGORIES[selectedWeaponCategoryIdx].weapons[selectedWeaponIdx].getExtraStats().split(" | ").map((stat: string, i: number) => (
                          <span key={i}>{stat}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-400">Peso</div>
                    <div className="text-lg font-mono text-slate-200">
                      {(WEAPON_CATEGORIES[selectedWeaponCategoryIdx].weapons[selectedWeaponIdx].baseWeight + (WEAPON_CATEGORIES[selectedWeaponCategoryIdx].weapons[selectedWeaponIdx].weightStep * (selectedMaterialTier - 1))).toFixed(2)} kg
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleAddWeapon}
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={20} /> Adicionar Arma ao Carrinho
              </button>
            </div>
          ) : tab === 'armors' ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Tipo de Armadura</label>
                <div className="grid grid-cols-3 gap-2">
                  {ARMOR_TYPES.map((a, idx) => (
                    <button
                      key={a.type}
                      onClick={() => setSelectedArmorTypeIdx(idx)}
                      className={`p-3 rounded-xl text-sm border transition-all flex flex-col items-center gap-1 ${selectedArmorTypeIdx === idx ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                    >
                      <span className="font-bold">{a.type}</span>
                    </button>
                  ))}
                </div>
              </div>

              {selectedArmorTypeIdx > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Categoria do Material</label>
                  <div className="flex gap-2">
                    <button onClick={() => setSelectedArmorMaterialType('metal')} className={`flex-1 py-2 rounded-xl text-sm border transition-all ${selectedArmorMaterialType === 'metal' ? 'bg-slate-700 border-slate-400 text-white' : 'bg-slate-900/50 border-slate-700 text-slate-400'}`}>Metal</button>
                    <button onClick={() => setSelectedArmorMaterialType('wood')} className={`flex-1 py-2 rounded-xl text-sm border transition-all ${selectedArmorMaterialType === 'wood' ? 'bg-amber-900/50 border-amber-700 text-amber-200' : 'bg-slate-900/50 border-slate-700 text-slate-400'}`}>Madeira</button>
                    <button onClick={() => setSelectedArmorMaterialType('crystal')} className={`flex-1 py-2 rounded-xl text-sm border transition-all ${selectedArmorMaterialType === 'crystal' ? 'bg-purple-900/50 border-purple-500 text-purple-200' : 'bg-slate-900/50 border-slate-700 text-slate-400'}`}>Cristal</button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Peças / Partes do Corpo (Múltipla Seleção)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ARMOR_PARTS.map((p, idx) => {
                    const isSelected = selectedArmorPartIndices.includes(idx);
                    return (
                      <button
                        key={p.part}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedArmorPartIndices(prev => prev.filter(i => i !== idx));
                          } else {
                            setSelectedArmorPartIndices(prev => [...prev, idx]);
                          }
                        }}
                        className={`p-2 rounded-xl text-sm border transition-all ${isSelected ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                      >
                        {p.name} <span className="text-xs opacity-50 block">{p.part}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Nível do Material (1 a 11)</label>
                <input 
                  type="range" 
                  min="1" 
                  max="11" 
                  value={selectedArmorTier} 
                  onChange={(e) => setSelectedArmorTier(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <div className="text-center mt-2 font-medium text-emerald-400">
                  Nível {selectedArmorTier}
                </div>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Pré-visualização ({selectedArmorPartIndices.length} itens)</h3>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-lg font-bold text-white">
                      {selectedArmorPartIndices.length > 0 ? `${ARMOR_PARTS[selectedArmorPartIndices[0]].name}${selectedArmorPartIndices.length > 1 ? ' e outros' : ''}` : 'Nenhuma peça selecionada'} de {selectedArmorTypeIdx === 0 ? LEATHER_MATERIALS[selectedArmorTier - 1] : MATERIALS[selectedArmorTier - 1][selectedArmorMaterialType === 'leather' ? 'metal' : selectedArmorMaterialType]}
                    </div>
                    <div className="text-sm text-emerald-400 mt-1">
                      Camada: {ARMOR_TYPES[selectedArmorTypeIdx].layer} | Defesa {selectedArmorTypeIdx === 0 ? "Física, Mágica & Mística" : (selectedArmorMaterialType === 'leather' || selectedArmorMaterialType === 'metal' ? 'Física' : selectedArmorMaterialType === 'wood' ? 'Mágica' : 'Mística')}: +{selectedArmorTypeIdx === 0 ? (selectedArmorTier === 1 ? 0.5 : selectedArmorTier - 1) : (selectedArmorTypeIdx === 1 ? (selectedArmorTier === 1 ? 1 : (selectedArmorTier - 1) * 2) : (selectedArmorTier === 1 ? 2 : (selectedArmorTier - 1) * 4))} (por peça)
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-400">Peso Total</div>
                    <div className="text-lg font-mono text-slate-200">
                      {((ARMOR_TYPES[selectedArmorTypeIdx].baseWeight + (ARMOR_TYPES[selectedArmorTypeIdx].weightStep * (selectedArmorTier - 1))) * selectedArmorPartIndices.length).toFixed(2)} kg
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleAddArmor}
                disabled={selectedArmorPartIndices.length === 0}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={20} /> Adicionar {selectedArmorPartIndices.length} Peça(s) ao Carrinho
              </button>
              
              <button 
                onClick={handleAddArmorKit}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 border border-emerald-500/30"
              >
                <ShieldCheck size={20} /> Adicionar Kit Completo (Todas as Peças da Camada)
              </button>
            </div>
          ) : tab === 'accessories' ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Tipo de Acessório</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {ACCESSORY_TYPES.map((a, idx) => (
                    <button
                      key={a.name}
                      onClick={() => setSelectedAccessoryTypeIdx(idx)}
                      className={`p-2 rounded-xl text-sm border transition-all flex flex-col items-center gap-1 ${
                        selectedAccessoryTypeIdx === idx
                          ? 'bg-pink-500/20 border-pink-500 text-pink-300'
                          : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      <span className="font-semibold">{a.name}</span>
                      <span className="text-[10px] opacity-60">Gemas: {a.gemsAmt}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Metal (Nível)</label>
                <div className="flex gap-2 flex-wrap">
                  {ACCESSORY_METALS.map((m, idx) => (
                    <button
                      key={m.name}
                      onClick={() => setSelectedAccessoryMetalIdx(idx)}
                      className={`px-4 py-2 rounded-xl text-sm border transition-all ${
                        selectedAccessoryMetalIdx === idx
                          ? 'bg-pink-500/20 border-pink-500 text-pink-300 font-bold'
                          : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
                <div className="text-sm mt-3 text-slate-400">
                  Potencial Mínimo: <span className="font-bold text-pink-400">{ACCESSORY_METALS[selectedAccessoryMetalIdx].runas} Runa(s)</span> | 
                  Suporta gemas até Ranque <span className="font-bold text-pink-400">{ACCESSORY_METALS[selectedAccessoryMetalIdx].maxGem}</span>
                </div>
              </div>

              <button
                onClick={handleAddAccessory}
                className="w-full py-3 bg-pink-600 hover:bg-pink-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 mt-4"
              >
                <Plus size={20} /> Adicionar Acessório ao Carrinho
              </button>
            </div>
          ) : tab === 'gems' ? (
             <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Efeito da Gema</label>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                  {GEM_CATEGORIES.map((g, idx) => (
                    <button
                      key={g.name}
                      onClick={() => { setSelectedGemCategoryIdx(idx); setSelectedGemSubTypeIdx(0); }}
                      className={`p-2 rounded-xl text-sm border transition-all flex flex-col items-center gap-1 text-center ${
                        selectedGemCategoryIdx === idx
                          ? 'bg-fuchsia-500/20 border-fuchsia-500 text-fuchsia-300'
                          : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      <span className="font-semibold text-xs">{g.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Variável (Subtipo)</label>
                <div className="flex gap-2 flex-wrap">
                  {GEM_CATEGORIES[selectedGemCategoryIdx].subTypes.map((t, idx) => (
                    <button
                      key={t}
                      onClick={() => setSelectedGemSubTypeIdx(idx)}
                      className={`px-3 py-1.5 rounded-xl text-xs border transition-all ${
                        selectedGemSubTypeIdx === idx
                          ? 'bg-fuchsia-500/20 border-fuchsia-500 text-fuchsia-300 font-bold'
                          : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Ranque</label>
                <div className="flex gap-1 flex-wrap">
                  {GEM_RANKS.map((r, idx) => (
                    <button
                      key={r}
                      onClick={() => setSelectedGemRankIdx(idx)}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm shadow-sm border transition-all ${
                        selectedGemRankIdx === idx
                          ? 'bg-fuchsia-500/20 border-fuchsia-500 text-fuchsia-300 font-bold'
                          : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="p-4 rounded-xl border border-fuchsia-900/50 bg-fuchsia-900/20 text-sm shadow-inner">
                 <div className="font-bold text-fuchsia-300 mb-2 border-b border-fuchsia-900/30 pb-2">Bônus Concedido</div>
                 <div className="flex justify-between items-center mt-2">
                   <div className="text-slate-200">{GEM_CATEGORIES[selectedGemCategoryIdx].prefix}{GEM_CATEGORIES[selectedGemCategoryIdx].subTypes[Math.min(selectedGemSubTypeIdx, GEM_CATEGORIES[selectedGemCategoryIdx].subTypes.length - 1)]} <span className="font-bold text-emerald-400">+{GEM_CATEGORIES[selectedGemCategoryIdx].vals[selectedGemRankIdx]}</span></div>
                   <div className="text-slate-400 text-xs">Custo de Energia: <span className="font-mono text-fuchsia-400 font-bold ml-1">{GEM_CATEGORIES[selectedGemCategoryIdx].runas[selectedGemRankIdx]}</span> Runas</div>
                 </div>
              </div>

              <button
                onClick={handleAddGem}
                className="w-full py-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 mt-4"
              >
                <Plus size={20} /> Adicionar Gema ao Carrinho
              </button>
            </div>
          ) : tab === 'bags' ? (
             <div className="space-y-6">
               <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Tamanho da Bolsa</label>
                <div className="flex gap-2">
                  {BAG_SIZES.map((s, idx) => (
                    <button
                      key={s.name}
                      onClick={() => setSelectedBagSizeIdx(idx)}
                      className={`flex-1 py-3 rounded-xl text-sm border transition-all flex flex-col items-center gap-1 ${
                        selectedBagSizeIdx === idx
                          ? 'bg-lime-500/20 border-lime-500 text-lime-300'
                          : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      <span className="font-semibold">{s.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Material</label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {BAG_MATERIALS.map((m, idx) => (
                    <button
                      key={m.name}
                      onClick={() => setSelectedBagMaterialIdx(idx)}
                      className={`p-2 rounded-xl text-xs border transition-all flex flex-col items-center gap-1 ${
                        selectedBagMaterialIdx === idx
                          ? 'bg-lime-500/20 border-lime-500 text-lime-300'
                          : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      <span className="font-semibold text-center">{m.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="p-4 rounded-xl border border-lime-900/50 bg-lime-900/20 text-sm flex justify-between items-center shadow-inner">
                 <div>
                   <div className="text-slate-400 text-xs mb-1">Capacidade de Carga Extra</div>
                   <div className="text-2xl font-mono font-bold text-lime-400">+{BAG_MATERIALS[selectedBagMaterialIdx].capacityKg} <span className="text-sm tracking-widest text-lime-400/50">KG</span></div>
                 </div>
                 <div className="text-right">
                   <div className="text-slate-400 text-xs mb-1">Peso da Bolsa Vazia</div>
                   <div className="text-lg font-mono text-slate-200">{(BAG_SIZES[selectedBagSizeIdx].baseWeightKg * (1 + 0.1 * selectedBagMaterialIdx)).toFixed(2)} kg</div>
                 </div>
              </div>
              
              <button
                onClick={handleAddBag}
                className="w-full py-3 bg-lime-600 hover:bg-lime-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 mt-4"
              >
                <Plus size={20} /> Adicionar Bolsa ao Carrinho
              </button>
            </div>
          ) : tab === 'shields' ? (
            <div className="space-y-6">
              {/* Shield Type */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Tipo de Escudo</label>
                <div className="grid grid-cols-3 gap-3">
                  {SHIELD_TYPES.map((s, idx) => (
                    <button
                      key={s.name}
                      onClick={() => setSelectedShieldTypeIdx(idx)}
                      className={`p-3 rounded-xl text-sm border transition-all flex flex-col items-center gap-1.5 ${
                        selectedShieldTypeIdx === idx
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                          : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      <span className="font-bold">{s.name}</span>
                      <span className="text-[10px] opacity-60">{s.secondaryLabel}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Material Type + Tier */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Categoria do Material</label>
                  <div className="flex gap-2">
                    <button onClick={() => setSelectedShieldMaterialType('metal')}   className={`flex-1 py-2 rounded-xl text-sm border transition-all ${selectedShieldMaterialType === 'metal'   ? 'bg-slate-700 border-slate-400 text-white' : 'bg-slate-900/50 border-slate-700 text-slate-400'}`}>Metal</button>
                    <button onClick={() => setSelectedShieldMaterialType('wood')}    className={`flex-1 py-2 rounded-xl text-sm border transition-all ${selectedShieldMaterialType === 'wood'    ? 'bg-amber-900/50 border-amber-700 text-amber-200' : 'bg-slate-900/50 border-slate-700 text-slate-400'}`}>Madeira</button>
                    <button onClick={() => setSelectedShieldMaterialType('crystal')} className={`flex-1 py-2 rounded-xl text-sm border transition-all ${selectedShieldMaterialType === 'crystal' ? 'bg-purple-900/50 border-purple-500 text-purple-200' : 'bg-slate-900/50 border-slate-700 text-slate-400'}`}>Cristal</button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Nível do Material (1 a 11)</label>
                  <input
                    type="range" min="1" max="11"
                    value={selectedShieldTier}
                    onChange={e => setSelectedShieldTier(Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                  <div className="text-center mt-2 font-medium text-cyan-400">
                    Nível {selectedShieldTier}: {MATERIALS[selectedShieldTier - 1][selectedShieldMaterialType]}
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Pré-visualização</h3>
                {(() => {
                  const shield = SHIELD_TYPES[selectedShieldTypeIdx];
                  const material = MATERIALS[selectedShieldTier - 1][selectedShieldMaterialType];
                  const defenseType = selectedShieldMaterialType === 'metal' ? 'Física' : selectedShieldMaterialType === 'wood' ? 'Mágica' : 'Mística';
                  const defenseVal = shield.defenseProg[selectedShieldTier - 1];
                  const secondaryVal = SECONDARY_BONUS_PROG[selectedShieldTier - 1];
                  const secondaryLabel = shield.secondaryLabel === 'Absorção' ? `Absorção ${defenseType}` : shield.secondaryLabel;
                  const weight = Number((shield.baseWeightKg + shield.weightStepKg * (selectedShieldTier - 1)).toFixed(2));
                  return (
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="text-lg font-bold text-white">Escudo {shield.name} de {material}</div>
                        <div className="text-sm text-cyan-400 mt-1">
                          Aptidão: Escuderia {MATERIALS[selectedShieldTier - 1].rank}
                        </div>
                        <div className="text-sm text-slate-300 mt-1">
                          Defesa {defenseType}: +{defenseVal} | {secondaryLabel}: +{secondaryVal}%
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">Dimensões: {shield.dimensions}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs text-slate-400">Peso</div>
                        <div className="text-lg font-mono text-slate-200">{weight.toFixed(1)} kg</div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <button
                onClick={handleAddShield}
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={20} /> Adicionar Escudo {SHIELD_TYPES[selectedShieldTypeIdx].name} ao Carrinho
              </button>
            </div>
          ) : tab === 'runas' ? (
            <div className="space-y-6">
              {/* Rune selector */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-violet-300 uppercase tracking-wider block mb-2">Selecionar Runa</label>
                  <select
                    value={selectedRuneEntryKey}
                    onChange={e => { setSelectedRuneEntryKey(e.target.value); setSelectedRunePotenciaIdx(0); }}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-violet-500 text-sm"
                  >
                    {RUNE_CATALOG.map(entry => {
                      const key = `${entry.baseName}||${entry.anchor}`;
                      const preview = entry.getPotenciaEffect(0);
                      return (
                        <option key={key} value={key}>
                          {entry.icon} {entry.baseName} ({entry.anchor}) — {preview.description.split('+')[0].split('-')[0].trim()}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-violet-300 uppercase tracking-wider block mb-2">Potencial</label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {RUNE_POTENCIAS.map((p, i) => {
                      const colors = selectedRuneEntry ? RUNE_COLOR_CLASSES[selectedRuneEntry.color] : RUNE_COLOR_CLASSES.indigo;
                      return (
                        <button
                          key={p}
                          onClick={() => setSelectedRunePotenciaIdx(i)}
                          className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                            selectedRunePotenciaIdx === i
                              ? `${colors.border} ${colors.bg} ${colors.text}`
                              : 'border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-300'
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Effect Preview */}
              {selectedRuneEntry && (() => {
                const effect = selectedRuneEntry.getPotenciaEffect(selectedRunePotenciaIdx);
                const colors = RUNE_COLOR_CLASSES[selectedRuneEntry.color];
                return (
                  <div className={`${colors.bg} border ${colors.border} rounded-2xl p-5 space-y-3`}>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{selectedRuneEntry.icon}</span>
                      <div>
                        <div className={`font-bold ${colors.text}`}>
                          {selectedRuneEntry.baseName} — {RUNE_POTENCIAS[selectedRunePotenciaIdx]}
                        </div>
                        <div className="text-xs text-slate-500">
                          Para: <strong className={colors.text}>{selectedRuneEntry.anchor === 'Ser' ? '👤 Seres' : '📦 Objetos'}</strong> • Categoria: {selectedRuneEntry.category}
                        </div>
                      </div>
                    </div>
                    <div className={`text-sm ${colors.text} bg-slate-900/40 rounded-xl p-3 border ${colors.border}`}>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Efeito</span>
                      {effect.description}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="text-slate-500">Tipo: <span className={colors.text}>{effect.type}</span></div>
                      <div className="text-slate-500">Valor: <span className={colors.text}>{effect.value}{effect.unit || ''}</span></div>
                      {effect.radius && <div className="text-slate-500">Raio: <span className={colors.text}>{effect.radius}m</span></div>}
                    </div>
                    <div className="text-xs text-slate-500 italic">
                      ᚱ Runas podem ser ativadas e desativadas mentalmente a qualquer momento
                    </div>
                  </div>
                );
              })()}

              <button
                onClick={handleAddRune}
                disabled={!selectedRuneEntry}
                className="w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={20} /> Adicionar Runa ao Carrinho
              </button>
            </div>
          ) : null}
        </div>

        {/* Floating Cart / Toast Summary */}
        <div className={`transition-all duration-300 border-t border-slate-700 p-4 ${cart.length > 0 ? 'bg-indigo-900/50 block' : 'hidden'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingCart className="text-indigo-400" size={24} />
                <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {cart.length}
                </span>
              </div>
              <div>
                <div className="text-sm font-bold text-white">Carrinho de Compras</div>
                <div className="text-xs text-indigo-300">
                  {showToast ? <span className="flex items-center gap-1 text-emerald-400"><Check size={12}/> Item adicionado!</span> : `${cart.length} item(s) aguardando confirmação.`}
                </div>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/20"
            >
              <Check size={18} /> Confirmar Compra
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
