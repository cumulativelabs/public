import { SiteHeader } from './components/SiteHeader';
import { useReveal } from './hooks/useReveal';
import { ApproachSection } from './sections/ApproachSection';
import { ClosingManifesto } from './sections/ClosingManifesto';
import { HeroSection } from './sections/HeroSection';
import { MissionSection } from './sections/MissionSection';
import { PrinciplesSection } from './sections/PrinciplesSection';
import { WorkSection } from './sections/WorkSection';

export default function App() {
  useReveal();

  return (
    <div className="site-canvas site-canvas--master">
      <SiteHeader />
      <main id="main-content">
        <HeroSection />
        <MissionSection />
        <ApproachSection />
        <WorkSection />
        <PrinciplesSection />
        <ClosingManifesto />
      </main>
    </div>
  );
}
