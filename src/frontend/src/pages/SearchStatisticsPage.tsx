import { useTheme } from '@mui/material/styles';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { PrismaEditor } from "../components/prisma/PrismaEditor";
import { useState } from 'react';
import { PrismaReport } from '../components/prisma/PrismaReport';
import { PrismaCharts } from '../components/prisma/PrismaCharts';

interface TabPanelProps {
  children?: React.ReactNode;
  dir?: string;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
  
    >
      {value === index && (
        <Box sx={{ marginTop: 3, paddingLeft: 2 }}>
          <p>{children}</p>
        </Box>
      )}
    </div>
  );
}


const apiData = {
  query: "IA",
  totalArticles: 45,
  duplicatedResultsRemoved: 262,

  articlesByEngine: {
    ACM: 4,
    HAL: 16,
    IEEE: 12,
    Springer: 13,
  },

  filterImpactByEngine: {
    ACM: {
      YearResultFilter: { INPUT: 200, OUTPUT: 15, DROPPED: 185 },
      DuplicateResultFilter: { INPUT: 15, OUTPUT: 4, DROPPED: 11 },
    },
    HAL: {
      YearResultFilter: { INPUT: 200, OUTPUT: 107, DROPPED: 93 },
      DuplicateResultFilter: { INPUT: 107, OUTPUT: 16, DROPPED: 91 },
    },
    IEEE: {
      YearResultFilter: { INPUT: 100, OUTPUT: 55, DROPPED: 45 },
      DuplicateResultFilter: { INPUT: 55, OUTPUT: 12, DROPPED: 43 },
    },
    Springer: {
      YearResultFilter: { INPUT: 180, OUTPUT: 130, DROPPED: 50 },
      DuplicateResultFilter: { INPUT: 130, OUTPUT: 13, DROPPED: 117 },
    },
  },

  /* ---------- Full article list ---------- */
  articles: [
    /* ---------- ACM (4 articles) ---------- */
    {
      title: "A Survey on Machine Learning Techniques for Edge Computing",
      publicationYear: "2023",
      venue: "ACM Computing Surveys",
      venueType: "Journal",
      authors: ["David Miller", "Sofia Alvarez"],
      link: "https://dl.acm.org/doi/10.1145/acm-edge-2023",
      source: "ACM",
    },
    {
      title: "Improving Neural Ranking Models with Contrastive Feedback",
      publicationYear: "2022",
      venue:
        "ACM SIGIR Conference on Research and Development in Information Retrieval",
      venueType: "Conference",
      authors: ["Jun Li", "Rebecca Thompson", "Thomas Grayson"],
      link: "https://dl.acm.org/doi/10.1145/sigir-2022-contrastive",
      source: "ACM",
    },
    {
      title:
        "Federated Learning Approaches for Privacy-Preserving NLP",
      publicationYear: "2021",
      venue: "ACM Transactions on Information Systems",
      venueType: "Journal",
      authors: ["Elena Petrova", "Michael O'Neill"],
      link: "https://dl.acm.org/doi/10.1145/tois-fl-nlp",
      source: "ACM",
    },
    {
      title:
        "Low-Resource Transformer Adaptation Using Knowledge Distillation",
      publicationYear: "2020",
      venue: "Proceedings of the ACM Symposium on Applied Computing",
      venueType: "Conference",
      authors: ["Sarah Gupta", "Lorenzo Ricci"],
      link: "https://dl.acm.org/doi/10.1145/sac-transformers",
      source: "ACM",
    },

    /* ---------- HAL (16 articles) ---------- */
    {
      title:
        "Deep Reinforcement Learning for Distributed Energy Optimization",
      publicationYear: "2022",
      venue: "HAL Archives Ouvertes",
      venueType: "Preprint",
      authors: ["Camille Leroy", "Nicolas Martin"],
      link: "https://hal.archives-ouvertes.fr/hal-energy-ai",
      source: "HAL",
    },
    {
      title: "Graph Neural Networks for Traffic Flow Forecasting",
      publicationYear: "2021",
      venue: "HAL Research Papers",
      venueType: "Preprint",
      authors: ["Pierre Laurent", "Hannah Becker"],
      link: "https://hal.archives-ouvertes.fr/hal-gnn-traffic",
      source: "HAL",
    },
    {
      title:
        "Multilingual Language Models for Low-Resource European Languages",
      publicationYear: "2023",
      venue: "HAL Linguistics",
      venueType: "Preprint",
      authors: ["Anna Schmidt", "Claire Dubois"],
      link: "https://hal.archives-ouvertes.fr/hal-multilingual",
      source: "HAL",
    },
    {
      title:
        "Automatic Speech Recognition for Noisy Industrial Environments",
      publicationYear: "2020",
      venue: "HAL Machine Learning",
      venueType: "Preprint",
      authors: ["Julien Moreau", "Alicia Romero"],
      link: "https://hal.archives-ouvertes.fr/hal-asr-noise",
      source: "HAL",
    },
    {
      title:
        "Efficient Hyperparameter Tuning for Large Language Models",
      publicationYear: "2023",
      venue: "HAL Computer Science",
      venueType: "Preprint",
      authors: ["Lucas Bernard", "Marta Fernandes"],
      link: "https://hal.archives-ouvertes.fr/hal-hpt-llm",
      source: "HAL",
    },
    {
      title:
        "Vision Transformers for Satellite Image Segmentation",
      publicationYear: "2021",
      venue: "HAL Remote Sensing",
      venueType: "Preprint",
      authors: ["Aurelien Petit", "Noah Clarke"],
      link: "https://hal.archives-ouvertes.fr/hal-vit-satellite",
      source: "HAL",
    },
    {
      title:
        "Neural Style Transfer for Scientific Visualization",
      publicationYear: "2022",
      venue: "HAL Visualization",
      venueType: "Preprint",
      authors: ["Léa Fontaine", "Carlos Mendes"],
      link: "https://hal.archives-ouvertes.fr/hal-style-visualization",
      source: "HAL",
    },
    {
      title:
        "Probabilistic Models for Climate Pattern Analysis",
      publicationYear: "2020",
      venue: "HAL Climate Studies",
      venueType: "Preprint",
      authors: ["Marie Rousseau", "Patrick Owens"],
      link: "https://hal.archives-ouvertes.fr/hal-climate-models",
      source: "HAL",
    },
    {
      title: "Self-Supervised Learning for Biomedical Imaging",
      publicationYear: "2023",
      venue: "HAL Bioinformatics",
      venueType: "Preprint",
      authors: ["Nadia Karim", "Valentin Meyer"],
      link: "https://hal.archives-ouvertes.fr/hal-ssl-bio",
      source: "HAL",
    },
    {
      title:
        "Acoustic Scene Classification Using Convolutional Twins",
      publicationYear: "2021",
      venue: "HAL Signal Processing",
      venueType: "Preprint",
      authors: ["Gaël Robert", "Isabella Rossi"],
      link: "https://hal.archives-ouvertes.fr/hal-acoustic-twins",
      source: "HAL",
    },
    {
      title:
        "Transformer-Based OCR for Historical Manuscripts",
      publicationYear: "2020",
      venue: "HAL Digital Humanities",
      venueType: "Preprint",
      authors: ["Claire Denis", "Mohammed Haddad"],
      link: "https://hal.archives-ouvertes.fr/hal-ocr-historical",
      source: "HAL",
    },
    {
      title:
        "Unsupervised Document Clustering Using Sentence Embeddings",
      publicationYear: "2022",
      venue: "HAL NLP",
      venueType: "Preprint",
      authors: ["Sven Hartmann", "Chloé Richard"],
      link: "https://hal.archives-ouvertes.fr/hal-doc-clustering",
      source: "HAL",
    },
    {
      title:
        "Differential Privacy for Distributed Text Mining",
      publicationYear: "2023",
      venue: "HAL Security",
      venueType: "Preprint",
      authors: ["Amélie Colin", "Rahul Batra"],
      link: "https://hal.archives-ouvertes.fr/hal-dp-text",
      source: "HAL",
    },
    {
      title:
        "Neural Machine Translation for Romance Languages",
      publicationYear: "2021",
      venue: "HAL Translation",
      venueType: "Preprint",
      authors: ["Luca Moretti", "Inès Bernard"],
      link: "https://hal.archives-ouvertes.fr/hal-romance-nmt",
      source: "HAL",
    },
    {
      title:
        "Predicting Equipment Failure with Temporal Neural Networks",
      publicationYear: "2022",
      venue: "HAL Engineering",
      venueType: "Preprint",
      authors: ["Théo Lambert", "Emily Carter"],
      link: "https://hal.archives-ouvertes.fr/hal-equipment-prediction",
      source: "HAL",
    },
    {
      title:
        "Semantic Parsing for Conversational Agents",
      publicationYear: "2020",
      venue: "HAL AI Research",
      venueType: "Preprint",
      authors: ["Romain Vidal", "Sara Johansson"],
      link: "https://hal.archives-ouvertes.fr/hal-semantic-parsing",
      source: "HAL",
    },

    /* ---------- IEEE (12 articles) ---------- */
    {
      title:
        "A Lightweight CNN Model for Mobile Image Recognition",
      publicationYear: "2022",
      venue: "IEEE Transactions on Mobile Computing",
      venueType: "Journal",
      authors: ["Yun Park", "Emily Foster"],
      link: "https://ieeexplore.ieee.org/document/mobile-cnn",
      source: "IEEE",
    },
    {
      title:
        "Reinforcement Learning for Smart Grid Stability Control",
      publicationYear: "2023",
      venue: "IEEE Transactions on Smart Grid",
      venueType: "Journal",
      authors: ["Ahmed Rashid", "Jean-Paul Marin"],
      link: "https://ieeexplore.ieee.org/document/rl-grid",
      source: "IEEE",
    },
    {
      title:
        "Efficient FPGA Acceleration for Transformer Inference",
      publicationYear: "2021",
      venue:
        "IEEE International Symposium on Circuits and Systems",
      venueType: "Conference",
      authors: ["Kai Chen", "Victor Alvarez"],
      link: "https://ieeexplore.ieee.org/document/fpga-transformer",
      source: "IEEE",
    },
    {
      title: "Multi-Agent Systems for Industrial Robotics",
      publicationYear: "2020",
      venue: "IEEE Robotics and Automation Letters",
      venueType: "Journal",
      authors: ["Laura Spencer", "Minh Nguyen"],
      link: "https://ieeexplore.ieee.org/document/mas-robotics",
      source: "IEEE",
    },
    {
      title: "Deep Learning for Network Intrusion Detection",
      publicationYear: "2023",
      venue: "IEEE Conference on Communications",
      venueType: "Conference",
      authors: ["Ravi Shankar", "Elodie Lemaire"],
      link: "https://ieeexplore.ieee.org/document/dl-ids",
      source: "IEEE",
    },
    {
      title:
        "High-Resolution Radar Imaging Using Transformer Architectures",
      publicationYear: "2021",
      venue:
        "IEEE Transactions on Geoscience and Remote Sensing",
      venueType: "Journal",
      authors: ["Helen Zhou", "Nicolas Dupont"],
      link: "https://ieeexplore.ieee.org/document/radar-transformer",
      source: "IEEE",
    },
    {
      title:
        "Adversarial Training for Reliable Medical Diagnosis",
      publicationYear: "2020",
      venue: "IEEE Transactions on Medical Imaging",
      venueType: "Journal",
      authors: ["Fatima Ali", "Thomas Müller"],
      link: "https://ieeexplore.ieee.org/document/adv-medical",
      source: "IEEE",
    },
    {
      title:
        "Optimizing Wireless Sensor Networks with Deep RL",
      publicationYear: "2022",
      venue: "IEEE Sensors Journal",
      venueType: "Journal",
      authors: ["Amanda Cook", "Javier Ortega"],
      link: "https://ieeexplore.ieee.org/document/wsn-rl",
      source: "IEEE",
    },
    {
      title:
        "Secure Federated Learning for IoT Devices",
      publicationYear: "2023",
      venue: "IEEE Internet of Things Journal",
      venueType: "Journal",
      authors: ["Mo Chen", "Linda Walters"],
      link: "https://ieeexplore.ieee.org/document/fl-iot",
      source: "IEEE",
    },
    {
      title:
        "Speech Enhancement Using Cross-Domain Transformers",
      publicationYear: "2021",
      venue: "IEEE Signal Processing Letters",
      venueType: "Journal",
      authors: ["Tobias Weber", "Maria Santos"],
      link: "https://ieeexplore.ieee.org/document/speech-xformer",
      source: "IEEE",
    },
    {
      title:
        "Hybrid Classical–Quantum Models for Time Series Forecasting",
      publicationYear: "2022",
      venue: "IEEE Quantum",
      venueType: "Journal",
      authors: ["Rina Takahashi", "Paulo Coelho"],
      link: "https://ieeexplore.ieee.org/document/hybrid-quantum-ts",
      source: "IEEE",
    },
    {
      title:
        "Graph-Based Intrusion Detection with Temporal Features",
      publicationYear: "2020",
      venue: "IEEE CNS",
      venueType: "Conference",
      authors: ["Samir Patel", "Gwen Hardy"],
      link: "https://ieeexplore.ieee.org/document/graph-ids",
      source: "IEEE",
    },

    /* ---------- Springer (13 articles) ---------- */
    {
      title:
        "BERT-Based Question Answering for Financial Documents",
      publicationYear: "2023",
      venue: "Machine Learning Journal",
      venueType: "Journal",
      authors: ["Andrea König", "Felipe Duarte"],
      link: "https://springer.com/bert-finance",
      source: "Springer",
    },
    {
      title:
        "Hybrid CNN–RNN Models for Document Classification",
      publicationYear: "2022",
      venue: "Neural Computing and Applications",
      venueType: "Journal",
      authors: ["Carla Ribeiro", "Jonas Nilsson"],
      link: "https://springer.com/hybrid-cnn-rnn",
      source: "Springer",
    },
    {
      title:
        "AI-Assisted Decision Making in Healthcare Systems",
      publicationYear: "2021",
      venue: "Health Informatics Journal",
      venueType: "Journal",
      authors: ["Omar Khalid", "Mélanie Robert"],
      link: "https://springer.com/ai-health",
      source: "Springer",
    },
    {
      title:
        "Semantic Role Labeling with Transformer Embeddings",
      publicationYear: "2020",
      venue: "Journal of Language Technology",
      venueType: "Journal",
      authors: ["Jinwoo Park", "Nadia Ferreira"],
      link: "https://springer.com/srl-transformer",
      source: "Springer",
    },
    {
      title:
        "Uncertainty Estimation in Neural Regression Models",
      publicationYear: "2023",
      venue:
        "International Journal of Approximate Reasoning",
      venueType: "Journal",
      authors: ["Petra Schmidt", "Lucas Silva"],
      link: "https://springer.com/uncertainty-regression",
      source: "Springer",
    },
    {
      title:
        "Neural Topic Modeling for Legal Document Analysis",
      publicationYear: "2021",
      venue: "Journal of Information Systems",
      venueType: "Journal",
      authors: ["Marco Ferraro", "Pauline Niemann"],
      link: "https://springer.com/legal-topic-models",
      source: "Springer",
    },
    {
      title:
        "Visual Analytics for Explainable AI Models",
      publicationYear: "2022",
      venue: "Visual Computer",
      venueType: "Journal",
      authors: ["Naomi Klein", "Fabio Martins"],
      link: "https://springer.com/vis-explainable-ai",
      source: "Springer",
    },
    {
      title:
        "Deep Learning for Genomic Variant Prediction",
      publicationYear: "2020",
      venue: "Bioinformatics Review",
      venueType: "Journal",
      authors: ["Rita Lopes", "Christian Adler"],
      link: "https://springer.com/genomics-dl",
      source: "Springer",
    },
    {
      title:
        "Graph Embeddings for Financial Fraud Detection",
      publicationYear: "2023",
      venue:
        "Journal of Financial Data Science",
      venueType: "Journal",
      authors: ["Yara Mendes", "Stephen Clark"],
      link: "https://springer.com/graph-fraud",
      source: "Springer",
    },
    {
      title:
        "Efficient Knowledge Graph Completion Using Distilled Embeddings",
      publicationYear: "2022",
      venue:
        "Data Mining and Knowledge Discovery",
      venueType: "Journal",
      authors: ["Nguyen Tran", "Laura Popescu"],
      link: "https://springer.com/kg-distillation",
      source: "Springer",
    },
    {
      title:
        "Adaptive Multi-Task Learning for Scientific Content Analysis",
      publicationYear: "2021",
      venue:
        "Journal of Intelligent Information Systems",
      venueType: "Journal",
      authors: ["Teresa Varga", "Anish Kapoor"],
      link: "https://springer.com/multi-task-science",
      source: "Springer",
    },
    {
      title:
        "Improving Text Summarization with Reinforcement Signals",
      publicationYear: "2023",
      venue: "Neural Processing Letters",
      venueType: "Journal",
      authors: ["Hiro Tanaka", "Maria Costa"],
      link: "https://springer.com/rl-summarization",
      source: "Springer",
    },
    {
      title:
        "Unsupervised Keyword Extraction with Sentence Embeddings",
      publicationYear: "2020",
      venue: "Information Retrieval Journal",
      venueType: "Journal",
      authors: ["Francesco Romano", "Julie Werner"],
      link: "https://springer.com/keyword-extraction",
      source: "Springer",
    },
  ],
};

export const SearchStatisticsPage = () => {
  const theme = useTheme();
    const [tab, setTab] = useState(0);

  return (
    <Box sx={{ width: "100%" }}>
      <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)}>
        <Tab label="Flow" />
        <Tab label="Report" />
        <Tab label="Charts" />
      </Tabs>

      <TabPanel value={tab} index={0} dir={theme.direction}>
        <PrismaEditor apiData={apiData} />
      </TabPanel>

      <TabPanel value={tab} index={1} dir={theme.direction}>
        <PrismaReport data={apiData} />
      </TabPanel>

      <TabPanel value={tab} index={2} dir={theme.direction}>
        <PrismaCharts data={apiData} />
      </TabPanel>
    </Box>
  );
};