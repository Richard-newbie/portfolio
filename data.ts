export type Discipline = 'web' | 'automation' | 'voice' | 'creative';

// Add verified studio details here when they are ready for publication.
export const studio = {
  name: 'Festus Labs',
  owner: 'Oluwatobi Festus',
  email: '',
  portraitUrl: '',
};

export const services: {
  id: Discipline;
  name: string;
  shortName: string;
  description: string;
  tools: string[];
  color: string;
}[] = [
  {
    id: 'web',
    name: 'Web Development',
    shortName: 'Web',
    description: 'Thoughtful websites that look right, feel right and work hard. From a first landing page to a complete publishing platform.',
    tools: ['Ghost CMS', 'WordPress', 'Landing Pages', 'API Integration'],
    color: '#d2f76b',
  },
  {
    id: 'automation',
    name: 'AI Automation',
    shortName: 'Automation',
    description: 'Less repetitive work. More room to think. I connect your tools and turn everyday processes into useful, reliable workflows.',
    tools: ['Make', 'n8n', 'Zapier', 'Airtable', 'Google Sheets', 'Webhooks', 'API Workflows', 'CRM Automation', 'Lead Automation'],
    color: '#e8bd80',
  },
  {
    id: 'voice',
    name: 'AI Voice and Agents',
    shortName: 'Voice',
    description: 'Conversational experiences with a human touch. Voice agents that answer questions, guide customers and keep conversations moving.',
    tools: ['Vapi', 'Retell', 'ElevenLabs', 'Conversational AI'],
    color: '#a6c8ef',
  },
  {
    id: 'creative',
    name: 'AI Video and Creative',
    shortName: 'Creative',
    description: 'Ideas made visible. I bring together creative direction and AI tools to explore stories, commercials and memorable moving images.',
    tools: ['Veo', 'Sora', 'Runway', 'AI Commercials', 'UGC Videos', '3D Animation', 'AI Storytelling', 'Video Editing'],
    color: '#d9b0c0',
  },
];

export const technology = [
  { discipline: 'web' as const, name: 'Web Development', tools: ['Ghost', 'WordPress', 'Elementor', 'LearnPress'], note: 'A considered home for your ideas.' },
  { discipline: 'automation' as const, name: 'Automation', tools: ['Make', 'n8n', 'Zapier', 'Airtable', 'Google Sheets'], note: 'Your tools, working together.' },
  { discipline: 'voice' as const, name: 'AI Voice', tools: ['Vapi', 'Retell', 'ElevenLabs'], note: 'Technology that listens.' },
  { discipline: 'creative' as const, name: 'AI Creative', tools: ['Veo', 'Sora', 'Runway'], note: 'New ways to tell your story.' },
];

export type Project = {
  id: string;
  name: string;
  discipline: Discipline;
  category: string;
  summary: string;
  description: string;
  built: string;
  tools: string[];
};

export const projects: Project[] = [
  {
    id: 'form-field',
    name: 'Form & Field',
    discipline: 'web',
    category: 'Editorial website',
    summary: 'A quieter kind of digital publishing.',
    description: 'An independent concept for an architecture and slow living journal. An exploration of generous typography, thoughtful content structure and an effortless reading experience.',
    built: 'Responsive editorial interface, journal index and article reading experience.',
    tools: ['Ghost CMS', 'Web Design', 'Responsive Development'],
  },
  {
    id: 'connected-workflow',
    name: 'The connected workflow',
    discipline: 'automation',
    category: 'Automation system',
    summary: 'From new inquiry to the right next step.',
    description: 'A sample inquiry workflow that illustrates how a form submission can move into a database, be organized by an AI step and become a clear follow up task. The interactive preview is a local simulation, not a live integration.',
    built: 'An interactive workflow demonstration with input, enrichment, storage and notification stages.',
    tools: ['n8n', 'Airtable', 'Webhooks', 'API Workflows'],
  },
  {
    id: 'human-interface',
    name: 'A more human interface',
    discipline: 'voice',
    category: 'Conversational experience',
    summary: 'A useful conversation starts with listening.',
    description: 'A voice agent concept for answering initial project questions and helping a visitor find the right service. The preview uses a scripted conversation and your browser voice, rather than a connected AI agent.',
    built: 'Conversation design, a sample dialogue and an accessible voice playback interface.',
    tools: ['Vapi', 'Retell', 'ElevenLabs'],
  },
  {
    id: 'beyond-ordinary',
    name: 'Beyond the ordinary',
    discipline: 'creative',
    category: 'Creative campaign study',
    summary: 'An imagined product. A tangible atmosphere.',
    description: 'A visual concept exploring a fictional fragrance through material, light and atmosphere. Generated campaign imagery is presented as a storyboard study, not a commissioned commercial or a finished video.',
    built: 'Product art direction, generated campaign imagery and a three scene visual treatment.',
    tools: ['AI Art Direction', 'Veo', 'Runway', 'Video Editing'],
  },
];

export const processSteps = [
  { title: 'Discover', description: 'Understand the problem, goals and requirements.', detail: 'We start with a conversation. What needs to work better, who is it for and what would a useful solution look like?' },
  { title: 'Build', description: 'Design and develop the appropriate digital solution.', detail: 'I connect the right design, technology and tools, keeping you close to the decisions that shape the result.' },
  { title: 'Test', description: 'Refine the experience, workflows and integrations.', detail: 'We work through the details together, test real scenarios and make sure the moving pieces work as they should.' },
  { title: 'Deliver', description: 'Launch a reliable solution with a clear handoff.', detail: 'Your project goes live with the guidance and documentation you need to confidently make it your own.' },
];

export type Testimonial = { quote: string; name: string; role: string };
export const testimonials: Testimonial[] = [];