import { useTheme } from '@mui/material/styles';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { FlowEditor } from "../components/prisma/FlowEditor";
import { useState } from 'react';
import { FlowReport } from '../components/prisma/FlowReport';

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
  articlesByEngine: { ACM: 4, HAL: 16, IEEE: 12, Springer: 13 },
  duplicatedResultsRemoved: 262,
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
};

export const SearchStatisticsPage = () => {
  const theme = useTheme();
    const [tab, setTab] = useState(0);

  return (
    <Box sx={{ width: "100%" }}>
      <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)}>
        <Tab label="PRISMA" />
        <Tab label="Report" />
        <Tab label="Item Three" />
      </Tabs>

      <TabPanel value={tab} index={0} dir={theme.direction}>
        <FlowEditor apiData={apiData} />
      </TabPanel>

      <TabPanel value={tab} index={1} dir={theme.direction}>
        <FlowReport data={apiData} />
      </TabPanel>

      <TabPanel value={tab} index={2} dir={theme.direction}>
        Item Three
      </TabPanel>
    </Box>
  );
};