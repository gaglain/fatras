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

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const navSelector = (isMobile: boolean, path: string) =>
  isMobile ? `[data-tour="mobilenav-${path}"]` : `a[href="${path}"]`;

const buildInstallStep = (): DriveStep => {
  const os = getDeviceOS();
  if (isStandalonePWA()) {
    return {
      popover: {
        title: '📱 App déjà installée',
        description:
          "Parfait — vous utilisez déjà Fatras en mode application. Vous bénéficiez du plein écran et des notifications.",
      },
    };
  }
  if (os === 'ios') {
    return {
      popover: {
        title: '📲 Installer Fatras sur iPhone',
        description: `
          <ol style="padding-left:1.1rem;line-height:1.5;font-size:0.9rem;">
            <li>Ouvrez ce site dans <b>Safari</b> (pas Chrome).</li>
            <li>Appuyez sur l'icône <b>Partager</b> <span style="font-size:1.1em">⬆️</span> en bas.</li>
            <li>Faites défiler et choisissez <b>« Sur l'écran d'accueil »</b>.</li>
            <li>Validez avec <b>Ajouter</b>.</li>
          </ol>
          <p style="margin-top:0.5rem;font-size:0.85rem;opacity:0.8;">Fatras apparaîtra comme une vraie app.</p>
        `,
      },
    };
  }
  if (os === 'android') {
    return {
      popover: {
        title: '📲 Installer Fatras sur Android',
        description: `
          <ol style="padding-left:1.1rem;line-height:1.5;font-size:0.9rem;">
            <li>Ouvrez ce site dans <b>Chrome</b>.</li>
            <li>Touchez le menu <b>⋮</b> en haut à droite.</li>
            <li>Choisissez <b>« Installer l'application »</b> ou <b>« Ajouter à l'écran d'accueil »</b>.</li>
            <li>Confirmez avec <b>Installer</b>.</li>
          </ol>
          <p style="margin-top:0.5rem;font-size:0.85rem;opacity:0.8;">Une notification d'install peut aussi apparaître automatiquement.</p>
        `,
      },
    };
  }
  return {
    popover: {
      title: '💻 Installer sur ordinateur',
      description: `
        <p>Dans <b>Chrome</b> ou <b>Edge</b>, cliquez sur l'icône d'installation <span style="font-weight:bold">⊕</span> dans la barre d'adresse, puis sur <b>Installer</b>.</p>
        <p style="margin-top:0.5rem;font-size:0.85rem;opacity:0.8;">Sur votre téléphone, ouvrez ce lien directement depuis Safari (iPhone) ou Chrome (Android) pour installer l'app mobile.</p>
      `,
    },
  };
};

const adminSteps = (isMobile: boolean): DriveStep[] => [
  {
    popover: {
      title: '👋 Bienvenue sur Fatras',
      description:
        "Voici un tour rapide pour découvrir votre espace administrateur. Cela prend moins d'une minute.",
    },
  },
  {
    element: navSelector(isMobile, '/dashboard'),
    popover: {
      title: '📊 Tableau de bord',
      description: "Votre vue d'ensemble : dates, revenus, distance, CO₂ et tâches du jour.",
      side: isMobile ? 'top' : 'right',
    },
  },
  {
    element: navSelector(isMobile, '/contacts'),
    popover: {
      title: '👥 Contacts',
      description: 'Base partagée de tous vos contacts professionnels (programmateurs, lieux, presse…).',
      side: isMobile ? 'top' : 'right',
    },
  },
  {
    element: navSelector(isMobile, '/events'),
    popover: {
      title: '📅 Événements',
      description: 'Toutes les dates de concerts, avec carte, filtres et création rapide.',
      side: isMobile ? 'top' : 'right',
    },
  },
  {
    element: navSelector(isMobile, '/roadshow'),
    popover: {
      title: '🚐 Tournées (Roadshow)',
      description:
        'Logistique complète : feuilles de route, casting, hébergement, loges, transports et finances.',
      side: isMobile ? 'top' : 'right',
    },
  },
  ...(!isMobile
    ? [
        {
          element: 'a[href="/opportunities"]',
          popover: {
            title: '🎯 Opportunités & Devis',
            description: 'Pipeline commercial et devis : créez, envoyez, suivez la signature.',
            side: 'right' as const,
          },
        },
        {
          element: 'a[href="/email"]',
          popover: {
            title: '✉️ Emails',
            description: 'Boîte centralisée multi-comptes avec suivi des ouvertures et clics.',
            side: 'right' as const,
          },
        },
      ]
    : [
        {
          element: navSelector(isMobile, '/messagerie'),
          popover: {
            title: '💬 Messages',
            description: 'Chat d\'équipe et canaux privés par tournée.',
            side: 'top' as const,
          },
        },
      ]),
];

const artistSteps = (isMobile: boolean): DriveStep[] => [
  {
    popover: {
      title: '👋 Bienvenue !',
      description:
        "Votre espace artiste vous permet de consulter vos dates, vos feuilles de route et de confirmer votre présence.",
    },
  },
  {
    element: navSelector(isMobile, '/dashboard'),
    popover: {
      title: '🏠 Accueil',
      description: 'Vue rapide de vos prochaines dates et notifications importantes.',
      side: isMobile ? 'top' : 'right',
    },
  },
  {
    element: navSelector(isMobile, '/roadshow'),
    popover: {
      title: '🚐 Feuilles de route',
      description:
        'Consultez les détails logistiques (horaires, lieux, transport, loges) et confirmez votre présence sur chaque date.',
      side: isMobile ? 'top' : 'right',
    },
  },
  {
    element: navSelector(isMobile, '/events'),
    popover: {
      title: '📅 Vos dates',
      description: 'Toutes les dates de concert où vous êtes castés.',
      side: isMobile ? 'top' : 'right',
    },
  },
  {
    element: navSelector(isMobile, '/messagerie'),
    popover: {
      title: '💬 Messages',
      description: 'Échangez avec l\'équipe via les canaux privés de chaque tournée.',
      side: isMobile ? 'top' : 'right',
    },
  },
];

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
      // ensure tour runs from dashboard for stable selectors
      navigate('/dashboard', { replace: true });
      return;
    }
    startedRef.current = true;

    const roles = userRoles.map(r => r.role as AppRole);
    const isArtist =
      roles.includes('artiste') &&
      !roles.some(r => ['super_admin', 'admin', 'manager', 'collaborator'].includes(r));

    const roleSteps = isArtist ? artistSteps(isMobile) : adminSteps(isMobile);

    // Notifications step
    const notifStep: DriveStep = {
      popover: {
        title: '🔔 Activer les notifications',
        description: `
          <p>Recevez en temps réel les nouveaux messages, mentions, dates confirmées et rappels.</p>
          <p style="margin-top:0.5rem;font-size:0.85rem;opacity:0.8;">
            ${
              !isSupported
                ? 'Non supporté sur cet appareil — installez d\'abord l\'app (étape suivante).'
                : permission === 'granted'
                ? '✅ Déjà activé. Vous pouvez gérer ça dans Préférences → Notifications.'
                : 'Cliquez sur « Activer » ci-dessous pour autoriser les notifications.'
            }
          </p>
        `,
        showButtons:
          isSupported && permission !== 'granted'
            ? ['next', 'previous', 'close']
            : ['next', 'previous', 'close'],
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

    const installStep = buildInstallStep();

    const finalStep: DriveStep = {
      popover: {
        title: '🎉 Vous êtes prêt !',
        description: `
          <p>Vous pouvez relancer ce tour à tout moment depuis <b>Préférences → Mobile</b>.</p>
          <p style="margin-top:0.5rem;font-size:0.85rem;opacity:0.8;">Bon travail avec Fatras 💛</p>
        `,
      },
    };

    const allSteps: DriveStep[] = [...roleSteps, notifStep, installStep, finalStep];

    // Filter out steps whose elements don't exist to avoid driver.js errors
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
    // Defer to ensure DOM is mounted
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
