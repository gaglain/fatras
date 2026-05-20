import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { driver, type DriveStep, type Driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePermissions, type AppRole } from '@/hooks/usePermissions';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useWebPushNotifications } from '@/hooks/useWebPushNotifications';
import { getDeviceOS, isStandalonePWA } from '@/lib/deviceDetection';
import { logger } from '@/lib/logger';

interface OnboardingTourProps {
  forceStart?: boolean;
  onFinish?: () => void;
}

const navSelector = (isMobile: boolean, path: string) =>
  isMobile ? `[data-tour="mobilenav-${path}"]` : `a[href="${path}"]`;

/* =============================================================
   PWA INSTALL STEPS (multi-step per OS)
   ============================================================= */
const buildInstallSteps = (): DriveStep[] => {
  if (isStandalonePWA()) {
    return [
      {
        popover: {
          title: '📱 App déjà installée',
          description:
            "Parfait — vous utilisez déjà Fatras en mode application. Vous bénéficiez du plein écran, des notifications push et d'un démarrage instantané depuis votre écran d'accueil.",
        },
      },
    ];
  }
  const os = getDeviceOS();

  const iosSteps: DriveStep[] = [
    {
      popover: {
        title: '📲 Installer Fatras sur iPhone — étape 1/3',
        description: `
          <p>Pour profiter de Fatras comme une vraie app sur votre iPhone (plein écran, notifications, accès rapide).</p>
          <p style="margin-top:0.6rem"><b>1.</b> Ouvrez ce site dans <b>Safari</b> (l'installation ne fonctionne pas dans Chrome iOS).</p>
        `,
      },
    },
    {
      popover: {
        title: '📲 Étape 2/3 — Bouton Partager',
        description: `
          <p>En bas de l'écran (ou en haut sur iPad), touchez l'icône <b>Partager</b> :</p>
          <p style="font-size:1.8rem;text-align:center;margin:0.6rem 0">⬆️</p>
          <p style="font-size:0.85rem;opacity:0.8">C'est le carré avec une flèche vers le haut.</p>
        `,
      },
    },
    {
      popover: {
        title: '📲 Étape 3/3 — Ajouter à l\'écran d\'accueil',
        description: `
          <ol style="padding-left:1.1rem;line-height:1.55;font-size:0.9rem">
            <li>Faites défiler le menu et choisissez <b>« Sur l'écran d'accueil »</b>.</li>
            <li>Vous pouvez modifier le nom, puis touchez <b>Ajouter</b>.</li>
            <li>L'icône Fatras apparaît sur votre écran d'accueil — ouvrez-la pour lancer l'app en plein écran.</li>
          </ol>
        `,
      },
    },
  ];

  const androidSteps: DriveStep[] = [
    {
      popover: {
        title: '📲 Installer Fatras sur Android — étape 1/2',
        description: `
          <p>Pour profiter de Fatras comme une vraie app Android.</p>
          <p style="margin-top:0.6rem"><b>1.</b> Ouvrez ce site dans <b>Chrome</b> (ou Edge / Samsung Internet).</p>
          <p style="margin-top:0.4rem;font-size:0.85rem;opacity:0.8">Une bannière « Installer l'app » apparaît parfois automatiquement en bas de l'écran — touchez-la pour aller plus vite.</p>
        `,
      },
    },
    {
      popover: {
        title: '📲 Étape 2/2 — Menu Chrome',
        description: `
          <ol style="padding-left:1.1rem;line-height:1.55;font-size:0.9rem">
            <li>Touchez le menu <b>⋮</b> en haut à droite.</li>
            <li>Choisissez <b>« Installer l'application »</b> ou <b>« Ajouter à l'écran d'accueil »</b>.</li>
            <li>Validez avec <b>Installer</b>.</li>
            <li>L'icône Fatras apparaît sur votre écran d'accueil et dans votre tiroir d'applications.</li>
          </ol>
        `,
      },
    },
  ];

  const desktopSteps: DriveStep[] = [
    {
      popover: {
        title: '💻 Installer sur ordinateur',
        description: `
          <p>Dans <b>Chrome</b>, <b>Edge</b> ou <b>Brave</b> :</p>
          <ol style="padding-left:1.1rem;line-height:1.55;font-size:0.9rem">
            <li>Cliquez sur l'icône d'installation <b>⊕</b> dans la barre d'adresse (à droite de l'URL).</li>
            <li>Ou ouvrez le menu et choisissez <b>« Installer Fatras »</b>.</li>
            <li>Confirmez avec <b>Installer</b>.</li>
          </ol>
          <p style="margin-top:0.6rem;font-size:0.85rem;opacity:0.85"><b>💡 Sur votre téléphone :</b> ouvrez ce lien directement depuis Safari (iPhone) ou Chrome (Android) pour installer l'app mobile et recevoir les notifications.</p>
        `,
      },
    },
  ];

  if (os === 'ios') return iosSteps;
  if (os === 'android') return androidSteps;
  // Desktop: show both mobile + desktop info
  return [
    ...desktopSteps,
    {
      popover: {
        title: '📱 Sur iPhone / iPad',
        description: `
          <p>Ouvrez ce site dans <b>Safari</b>, touchez le bouton <b>Partager</b> ⬆️, puis <b>« Sur l'écran d'accueil »</b>.</p>
        `,
      },
    },
    {
      popover: {
        title: '🤖 Sur Android',
        description: `
          <p>Ouvrez ce site dans <b>Chrome</b>, touchez le menu <b>⋮</b>, puis <b>« Installer l'application »</b>.</p>
        `,
      },
    },
  ];
};

/* =============================================================
   ADMIN / MANAGER STEPS
   ============================================================= */
const adminSteps = (isMobile: boolean): DriveStep[] => [
  {
    popover: {
      title: '👋 Bienvenue sur Fatras',
      description: `
        <p>Voici votre <b>CRM complet de booking & tournées</b>. Ce tour de bienvenue vous présente chaque module et ce que vous pouvez y faire.</p>
        <p style="margin-top:0.6rem;font-size:0.85rem;opacity:0.85">⏱️ Durée : 3-4 minutes. Vous pouvez revoir ce tour à tout moment depuis <b>Préférences → Mobile</b>.</p>
      `,
    },
  },

  /* DASHBOARD */
  {
    element: navSelector(isMobile, '/dashboard'),
    popover: {
      title: '📊 Tableau de bord',
      description: `
        <p>Votre vue d'ensemble quotidienne :</p>
        <ul style="padding-left:1.1rem;line-height:1.55;font-size:0.9rem">
          <li>KPIs : dates confirmées, CA, distance, CO₂</li>
          <li>Tâches du jour & rappels</li>
          <li>Activité email de l'équipe</li>
          <li>Prochaines tournées</li>
        </ul>
      `,
      side: isMobile ? 'top' : 'right',
    },
  },

  /* CONTACTS (CRM) */
  {
    element: navSelector(isMobile, '/contacts'),
    popover: {
      title: '👥 Contacts — la base du CRM',
      description: `
        <p>Base <b>partagée</b> de tous vos contacts (programmateurs, lieux, presse, partenaires…).</p>
        <ul style="padding-left:1.1rem;line-height:1.55;font-size:0.9rem">
          <li>Filtres avancés, listes & tags</li>
          <li>Fusion intelligente des doublons</li>
          <li>Historique d'emails et engagement (ouvertures, clics)</li>
          <li>Liens automatiques avec événements, opportunités, tâches</li>
        </ul>
      `,
      side: isMobile ? 'top' : 'right',
    },
  },

  /* AGENDA / EVENTS */
  {
    element: navSelector(isMobile, '/events'),
    popover: {
      title: '📅 Événements & Agenda',
      description: `
        <p>Toutes vos <b>dates de concerts</b> en un seul endroit :</p>
        <ul style="padding-left:1.1rem;line-height:1.55;font-size:0.9rem">
          <li>Vue liste, calendrier et <b>carte interactive</b> (Leaflet)</li>
          <li>Filtres par artiste, statut, période, ville</li>
          <li>Création rapide via le wizard Contact → Event → Devis</li>
          <li>Synchronisation <b>Google Agenda</b> bidirectionnelle (via Nylas)</li>
          <li>Export <b>.ics</b> pour ajout dans n'importe quel calendrier</li>
        </ul>
      `,
      side: isMobile ? 'top' : 'right',
    },
  },

  /* ROADSHOW - in-depth */
  {
    element: navSelector(isMobile, '/roadshow'),
    popover: {
      title: '🚐 Tournées (Roadshow) — module central',
      description: `
        <p>Le <b>centre névralgique</b> de la logistique de tournée. Chaque date confirmée génère automatiquement un Roadshow.</p>
        <p style="margin-top:0.5rem;font-size:0.85rem;opacity:0.85">Les 4 étapes suivantes détaillent ce que vous pouvez y faire.</p>
      `,
      side: isMobile ? 'top' : 'right',
    },
  },
  {
    popover: {
      title: '🚐 Roadshow • Feuille de route',
      description: `
        <p>Pour chaque date, vous gérez en détail :</p>
        <ul style="padding-left:1.1rem;line-height:1.55;font-size:0.88rem">
          <li><b>Timeline complète</b> : balances, catering, soundcheck, show, load-out</li>
          <li><b>Casting</b> : musiciens, techniciens, équipe — chacun confirme/refuse sa présence</li>
          <li><b>Lieu</b> : adresse, contact local, infos venue</li>
          <li><b>Hébergement</b> : hôtel, adresse, réservations</li>
          <li><b>🚪 Loge</b> : disponible ou non, adresse si différente</li>
          <li><b>Transport</b> : véhicules, conducteurs, calcul distance & CO₂</li>
        </ul>
        <p style="margin-top:0.5rem;font-size:0.85rem;opacity:0.85">Tout est exportable en <b>PDF stylé</b> à envoyer à l'équipe.</p>
      `,
    },
  },
  {
    popover: {
      title: '🚐 Roadshow • Finances & Notes de frais',
      description: `
        <p>Suivi financier complet par date :</p>
        <ul style="padding-left:1.1rem;line-height:1.55;font-size:0.88rem">
          <li>Cachets, défraiements, transport, hébergement</li>
          <li><b>Notes de frais</b> avec upload de justificatifs (intégrés à la médiathèque)</li>
          <li>Récapitulatif financier par tournée et par artiste</li>
          <li>Calcul automatique TVA, frais d'admin, commissions</li>
        </ul>
      `,
    },
  },
  {
    popover: {
      title: '🚐 Roadshow • Partage privé & Synchro',
      description: `
        <p>Chaque tournée crée automatiquement :</p>
        <ul style="padding-left:1.1rem;line-height:1.55;font-size:0.88rem">
          <li>Un <b>canal de messagerie privé</b> pour l'équipe castée</li>
          <li>Une <b>feuille de route publique</b> partageable par lien (avec QR code)</li>
          <li>Une <b>synchro Google Agenda</b> de toutes les étapes (loge, balances, show…)</li>
          <li>Un <b>PDF de feuille de route</b> à envoyer aux musiciens</li>
        </ul>
      `,
    },
  },

  /* TASKS */
  ...(isMobile
    ? []
    : [
        {
          element: 'a[href="/tasks"]',
          popover: {
            title: '✅ Tâches',
            description: `
              <p>Gestion de tâches collaborative avec :</p>
              <ul style="padding-left:1.1rem;line-height:1.55;font-size:0.9rem">
                <li>Assignation à un ou plusieurs membres</li>
                <li>Échéances avec <b>rappels automatiques email + push</b></li>
                <li>Liens vers contacts, événements, opportunités</li>
                <li>Mentions <b>@équipe</b> qui notifient en temps réel</li>
                <li>Statuts : à faire, en cours, terminé</li>
              </ul>
            `,
            side: 'right' as const,
          },
        },
      ]),

  /* OPPORTUNITIES + QUOTES + CONTRACTS */
  ...(isMobile
    ? []
    : [
        {
          element: 'a[href="/opportunities"]',
          popover: {
            title: '🎯 Opportunités — pipeline commercial',
            description: `
              <p>Suivi de toutes vos négociations :</p>
              <ul style="padding-left:1.1rem;line-height:1.55;font-size:0.9rem">
                <li>Pipeline visuel par statut (lead → en cours → gagné/perdu)</li>
                <li>Liée à un contact, un artiste, une date</li>
                <li>Génération automatique de <b>devis</b> avec calculateur (cachets, frais admin, transport, TVA)</li>
                <li>Quand l'opportunité est <b>gagnée</b> → roadshow créé automatiquement</li>
              </ul>
            `,
            side: 'right' as const,
          },
        },
        {
          element: 'a[href="/contracts"]',
          popover: {
            title: '📄 Contrats',
            description: `
              <p>Centralisez tous vos contrats :</p>
              <ul style="padding-left:1.1rem;line-height:1.55;font-size:0.9rem">
                <li>Liés à un devis accepté ou à un événement</li>
                <li>Upload PDF, prévisualisation intégrée</li>
                <li>Statuts : brouillon, envoyé, signé</li>
                <li>Permaliens propres <code>/media/contrats/…</code></li>
              </ul>
            `,
            side: 'right' as const,
          },
        },
        {
          element: 'a[href="/email"]',
          popover: {
            title: '✉️ Emails centralisés',
            description: `
              <p>Boîte unifiée multi-comptes (Gmail via Nylas, SMTP, Resend) :</p>
              <ul style="padding-left:1.1rem;line-height:1.55;font-size:0.9rem">
                <li>Réception & envoi depuis l'app (booking@fatras.net…)</li>
                <li>Suivi : <b>ouvertures, clics, engagement par contact</b></li>
                <li>Templates avec variables & pièces jointes depuis la médiathèque</li>
                <li>Campagnes emailing avec analytics</li>
                <li>Signature personnalisée par utilisateur</li>
              </ul>
            `,
            side: 'right' as const,
          },
        },
        {
          element: 'a[href="/show-bible"]',
          popover: {
            title: '📚 Ressources (Show Bible)',
            description: `
              <p>Le <b>référentiel central</b> de chaque artiste / show :</p>
              <ul style="padding-left:1.1rem;line-height:1.55;font-size:0.9rem">
                <li>Setlists collaboratives avec librairie de chansons (BPM, paroles)</li>
                <li>Documents techniques (fiche tech, rider, plan de scène)</li>
                <li>Médiathèque (photos, logos, dossiers de presse)</li>
                <li>Notes partagées éditables par toute l'équipe</li>
                <li>Liens automatiques aux roadshows correspondants</li>
              </ul>
            `,
            side: 'right' as const,
          },
        },
        {
          element: 'a[href="/messagerie"]',
          popover: {
            title: '💬 Messagerie interne',
            description: `
              <p>Communication d'équipe en temps réel, accessible depuis cette page <b>et</b> via le <b>bouton flottant orange en bas à droite</b> 💬 présent partout dans l'app.</p>
              <ul style="padding-left:1.1rem;line-height:1.55;font-size:0.9rem">
                <li><b>Canaux par tournée</b> créés automatiquement (accès castés uniquement)</li>
                <li>Canal général d'équipe & messages privés</li>
                <li><b>Mentions @utilisateur</b> avec notifications push + email</li>
                <li>Notifications instantanées multi-canal (badge, son, OS)</li>
                <li>Réactivité en temps réel</li>
              </ul>
              <p style="margin-top:0.5rem;font-size:0.85rem;opacity:0.85">💡 Le <b>pop-up en bas à droite</b> vous permet d'envoyer un message sans quitter la page sur laquelle vous travaillez.</p>
            `,
            side: 'right' as const,
          },
        },

      ]),

  /* MOBILE: condensed messagerie step */
  ...(isMobile
    ? [
        {
          element: navSelector(isMobile, '/messagerie'),
          popover: {
            title: '💬 Messagerie interne',
            description: `
              <p>Chat d'équipe avec canaux par tournée, mentions @, et notifications push en temps réel.</p>
            `,
            side: 'top' as const,
          },
        },
      ]
    : []),
];

/* =============================================================
   ARTIST STEPS
   ============================================================= */
const artistSteps = (isMobile: boolean): DriveStep[] => [
  {
    popover: {
      title: '👋 Bienvenue sur Fatras',
      description: `
        <p>Votre espace artiste centralise tout ce dont vous avez besoin pour vos dates : <b>feuilles de route, agenda, ressources, messagerie</b>.</p>
        <p style="margin-top:0.5rem;font-size:0.85rem;opacity:0.85">⏱️ Tour rapide de 2 minutes.</p>
      `,
    },
  },
  {
    element: navSelector(isMobile, '/dashboard'),
    popover: {
      title: '🏠 Accueil',
      description: `
        <p>Votre vue rapide :</p>
        <ul style="padding-left:1.1rem;line-height:1.55;font-size:0.9rem">
          <li>Prochaines dates où vous êtes casté</li>
          <li>Présences à confirmer</li>
          <li>Notifications & rappels</li>
        </ul>
      `,
      side: isMobile ? 'top' : 'right',
    },
  },
  {
    element: navSelector(isMobile, '/roadshow'),
    popover: {
      title: '🚐 Feuilles de route',
      description: `
        <p>Pour chaque date, consultez en détail :</p>
        <ul style="padding-left:1.1rem;line-height:1.55;font-size:0.88rem">
          <li><b>Horaires</b> : balances, catering, show</li>
          <li><b>Adresse</b> du lieu & contact venue</li>
          <li><b>Hébergement</b> : hôtel & adresse</li>
          <li><b>🚪 Loge</b> : disponible ou non, adresse</li>
          <li><b>Transport</b> : véhicule & équipe</li>
          <li><b>Casting</b> : qui est présent</li>
        </ul>
        <p style="margin-top:0.5rem;font-size:0.85rem;opacity:0.85">📥 Vous pouvez <b>télécharger le PDF</b> de chaque feuille de route.</p>
      `,
      side: isMobile ? 'top' : 'right',
    },
  },
  {
    popover: {
      title: '✅ Confirmer votre présence',
      description: `
        <p>Sur chaque date où vous êtes casté, vous verrez un bouton :</p>
        <ul style="padding-left:1.1rem;line-height:1.55;font-size:0.9rem">
          <li><b>« Je confirme »</b> → l'équipe est notifiée</li>
          <li><b>« Indisponible »</b> → vous êtes retiré du casting, plus de relances</li>
        </ul>
        <p style="margin-top:0.5rem;font-size:0.85rem;opacity:0.85">Vous pouvez changer votre statut à tout moment.</p>
      `,
    },
  },
  {
    element: navSelector(isMobile, '/events'),
    popover: {
      title: '📅 Vos dates',
      description: `
        <p>Toutes les dates de concert où vous êtes castés, avec carte et filtres par période. Synchronisable avec <b>Google Agenda</b> ou export <b>.ics</b>.</p>
      `,
      side: isMobile ? 'top' : 'right',
    },
  },
  ...(!isMobile
    ? [
        {
          element: 'a[href="/show-bible"]',
          popover: {
            title: '📚 Ressources',
            description: `
              <p>Tout votre matériel artistique partagé :</p>
              <ul style="padding-left:1.1rem;line-height:1.55;font-size:0.9rem">
                <li>Setlists & paroles</li>
                <li>Fiches techniques & riders</li>
                <li>Plans de scène, photos, dossiers de presse</li>
                <li>Notes collaboratives</li>
              </ul>
            `,
            side: 'right' as const,
          },
        },
      ]
    : []),
  {
    element: navSelector(isMobile, '/messagerie'),
    popover: {
      title: '💬 Messagerie',
      description: `
        <p>Chaque tournée a son <b>canal privé</b> pour l'équipe. Vous y recevez les annonces, infos de dernière minute, et pouvez poser vos questions.</p>
        <p style="margin-top:0.5rem;font-size:0.85rem;opacity:0.85">Les <b>@mentions</b> vous envoient une notification push.</p>
      `,
      side: isMobile ? 'top' : 'right',
    },
  },
];

/* =============================================================
   COMPONENT
   ============================================================= */
export const OnboardingTour: React.FC<OnboardingTourProps> = ({ forceStart = false, onFinish }) => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const { userRoles, loading: rolesLoading } = usePermissions();
  const { completed, loading: onbLoading, markCompleted, resetCompleted } = useOnboarding();
  const { requestPermission, permission, isSupported } = useWebPushNotifications();
  const driverRef = useRef<Driver | null>(null);
  const startedRef = useRef(false);
  const [externalTrigger, setExternalTrigger] = useState(0);

  // Listen for global "replay tour" event
  useEffect(() => {
    const handler = () => {
      startedRef.current = false;
      resetCompleted();
      setExternalTrigger(v => v + 1);
    };
    window.addEventListener('fatras:start-onboarding', handler);
    return () => window.removeEventListener('fatras:start-onboarding', handler);
  }, [resetCompleted]);

  useEffect(() => {
    if (rolesLoading || onbLoading) return;
    const shouldStart = forceStart || externalTrigger > 0 || completed === false;
    if (!shouldStart || startedRef.current) return;
    if (!location.pathname.startsWith('/dashboard')) {
      navigate('/dashboard', { replace: true });
      return;
    }
    startedRef.current = true;

    const roles = userRoles.map(r => r.role as AppRole);
    const isArtist =
      roles.includes('artiste') &&
      !roles.some(r => ['super_admin', 'admin', 'manager', 'collaborator'].includes(r));

    const roleSteps = isArtist ? artistSteps(isMobile) : adminSteps(isMobile);

    /* Notifications push */
    const notifStep: DriveStep = {
      popover: {
        title: '🔔 Activer les notifications push',
        description: `
          <p>Recevez en temps réel sur votre téléphone :</p>
          <ul style="padding-left:1.1rem;line-height:1.55;font-size:0.88rem">
            <li>Nouveaux messages & mentions <b>@vous</b></li>
            <li>Confirmations de présence sur les dates</li>
            <li>Rappels de tâches et d'événements</li>
            <li>Nouveaux devis signés, opportunités gagnées</li>
          </ul>
          <p style="margin-top:0.6rem;font-size:0.85rem;opacity:0.85">
            ${
              !isSupported
                ? '⚠️ Non supporté sur cet appareil. <b>Installez d\'abord l\'app (étape suivante)</b> puis revenez activer les notifications.'
                : permission === 'granted'
                ? '✅ Déjà activé. Vous pouvez gérer ça dans <b>Préférences → Notifications</b>.'
                : '👇 Cliquez sur <b>Suivant</b> pour autoriser les notifications.'
            }
          </p>
        `,
        onNextClick: async (_el, _step, opts) => {
          if (isSupported && permission !== 'granted') {
            try {
              await requestPermission();
            } catch (e) {
              logger.error('Onboarding push permission error', e);
            }
          }
          opts.driver.moveNext();
        },
      },
    };

    /* Preferences */
    const preferencesStep: DriveStep = {
      popover: {
        title: '⚙️ Préférences personnelles',
        description: `
          <p>Personnalisez votre expérience depuis <b>Préférences</b> :</p>
          <ul style="padding-left:1.1rem;line-height:1.55;font-size:0.88rem">
            <li><b>Compte</b> : avatar, infos personnelles, mot de passe</li>
            <li><b>Notifications</b> : push, email, mentions</li>
            <li><b>Email</b> : connexion Gmail/SMTP, signature</li>
            <li><b>Agenda</b> : synchro Google Agenda</li>
            <li><b>Mobile</b> : instructions d'installation + <b>relancer ce tour</b></li>
          </ul>
        `,
      },
    };

    /* Final */
    const finalStep: DriveStep = {
      popover: {
        title: '🎉 Vous êtes prêt !',
        description: `
          <p>Vous connaissez maintenant les fonctionnalités principales de Fatras.</p>
          <ul style="padding-left:1.1rem;line-height:1.55;font-size:0.88rem;margin-top:0.4rem">
            <li>🔁 Pour <b>revoir ce tour</b> : Préférences → Mobile → « Relancer le tour »</li>
            <li>📱 Pour <b>installer l'app</b> : Préférences → Mobile → instructions par OS</li>
            <li>❓ Pour de l'aide : contactez l'équipe via la <b>messagerie interne</b></li>
          </ul>
          <p style="margin-top:0.6rem">Bon travail avec <b>Fatras</b> 🧡</p>
        `,
      },
    };

    const installSteps = buildInstallSteps();

    const allSteps: DriveStep[] = [
      ...roleSteps,
      notifStep,
      // Section separator for install
      {
        popover: {
          title: '📱 Installer Fatras sur votre téléphone',
          description: `
            <p>Pour profiter de Fatras au quotidien (notifications push, plein écran, accès rapide), installez-le sur votre appareil.</p>
            <p style="margin-top:0.5rem;font-size:0.85rem;opacity:0.85">Les étapes suivantes s'adaptent à votre appareil (${getDeviceOS().toUpperCase()}).</p>
          `,
        },
      },
      ...installSteps,
      preferencesStep,
      finalStep,
    ];

    // Filter out steps whose elements don't exist
    const validSteps = allSteps.filter(s => {
      if (!s.element || typeof s.element !== 'string') return true;
      return !!document.querySelector(s.element);
    });

    const d = driver({
      showProgress: true,
      animate: true,
      smoothScroll: true,
      allowClose: true,
      overlayOpacity: 0.6,
      stagePadding: 4,
      stageRadius: 8,
      progressText: '{{current}} / {{total}}',
      nextBtnText: 'Suivant →',
      prevBtnText: '← Précédent',
      doneBtnText: 'Terminer',
      popoverClass: 'fatras-driver-popover',
      steps: validSteps,
      onDestroyed: () => {
        markCompleted();
        onFinish?.();
        startedRef.current = false;
        setExternalTrigger(0);
      },
    });
    driverRef.current = d;
    setTimeout(() => d.drive(), 300);

    return () => {
      try {
        d.destroy();
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rolesLoading, onbLoading, completed, forceStart, isMobile, externalTrigger]);

  return null;
};
