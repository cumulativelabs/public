import { SiteHeader } from './components/SiteHeader';
import { useReveal } from './hooks/useReveal';
import { ApproachSection } from './sections/ApproachSection';
import { ClosingManifesto } from './sections/ClosingManifesto';
import { HeroSection } from './sections/HeroSection';
import { MissionSection } from './sections/MissionSection';
import { PrinciplesSection } from './sections/PrinciplesSection';
import { ProvingGroundSection } from './sections/ProvingGroundSection';
import { SiteFooter } from './sections/SiteFooter';
import { WhyCumulativeSection } from './sections/WhyCumulativeSection';
import { WorkSection } from './sections/WorkSection';

export default function App() {
  useReveal();

  return (
    <div className="site-canvas">
      <SiteHeader />
      <main id="main-content">
        <HeroSection />
        <MissionSection />
        <WhyCumulativeSection />
        <ApproachSection />
        <WorkSection />
        <ProvingGroundSection />
        <PrinciplesSection />
        <ClosingManifesto />
      </main>
      <SiteFooter />
    </div>
  );
}
