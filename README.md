# 🔑 KeyMaker Pro Database - Site Web Statique pour GitHub Pages

Ce dossier contient la totalité du contenu réel extrait de **`maker.chm`** (610 fiches de véhicules, calculateurs, pinouts et 1 184 schémas électroniques HD), organisé sous forme de **site web statique 100% autonome**.

---

## 🌟 Fonctionnalités du Site

* **Arborescence Réelle du CHM (`maker.hhc`)** :
  * 📖 **Introduction** : Guide officiel du logiciel (*Key Maker interface* - `second_topic.htm`)
  * ⛩️ **Asie (26 marques)** : Acura, Brilliance, Chang'an, Chery, Daewoo, Daihatsu, Honda, Hyundai, Infiniti, Isuzu, Kia, Lexus, Mazda, Mitsubishi, Nissan, Subaru, Suzuki, Toyota, Yamaha, etc.
  * 🏰 **Europe (35 marques)** : Alfa Romeo, Aprilia, Audi, BMW, Citroen, Dacia, DAF, Ducati, Ferrari, Fiat, Ford Europe, Iveco, Jaguar, Lancia, Land Rover, Mercedes, Opel, Peugeot, Renault, Seat, Skoda, Smart, Volkswagen, Volvo, etc.
  * 🦅 **USA (9 marques)** : Buick, Cadillac, Chevrolet, Chrysler, Dodge, Ford USA, Jeep, Lincoln, etc.
  * 🔄 **Interbrand & Calculateurs** : BCM2, BSI Delphi, BSI Marelli, BSI Valeo, Delphi Immobox, EDC17 Dump Maker, Immobox ST72334, Kessy, etc.
  * 📚 **Appendix** : Clone machines, Image Generator, Keys, Transponders, etc.
* **Recherche Instantanée en Direct** : Filtrez en temps réel par modèle de véhicule, référence d'EEPROM (ex: `93C66`, `95040`, `24C04`, `HC05`), type de transpondeur (ex: `ID48`, `PCF7936`, `Hitag2`) ou nom de calculateur (`CAS3`, `EDC17`).
* **Visualiseur HD & Loupe Intégrée (Lightbox)** : Cliquez sur n'importe quel schéma ou PCB pour l'agrandir en plein écran avec Zoom (+/-), Rotation 90° et Reset.
* **Navigation par URL Hash** : Permet le partage de liens directs (ex: `index.html#cas3.htm` ou `index.html#a4_vdo_1999_01.htm`).
* **100% Hors-Ligne & GitHub Pages Ready** : Aucun serveur ou base de données externe n'est requis.

---

## 🚀 Déploiement sur GitHub Pages

1. Créez un nouveau dépôt sur [GitHub](https://github.com/new) (ex: `keymaker-database`).
2. Uploadez tous les fichiers et sous-dossiers de ce dossier dans le dépôt.
3. Allez dans les **Settings** de votre dépôt > section **Pages**.
4. Sous **Build and deployment** :
   * **Source** : `Deploy from a branch`
   * **Branch** : `main` / `/(root)`
   * Cliquez sur **Save**.
5. Votre site sera immédiatement en ligne sur `https://<votre-compte>.github.io/keymaker-database/` !
