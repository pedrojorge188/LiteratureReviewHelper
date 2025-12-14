import { useTheme } from '@mui/material/styles';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { PrismaEditor } from "../components/prisma/PrismaEditor";
import { useState } from 'react';
import { PrismaReport } from '../components/prisma/PrismaReport';
import { PrismaCharts } from '../components/prisma/PrismaCharts';
import { SearchResponseDto } from './types';
import { useTranslation } from 'react-i18next';

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

export const SearchStatisticsPage = (apiData: SearchResponseDto) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ width: "100%" }}>
      <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)}>
        <Tab label={t("prisma:tab_flow")} />
        <Tab label={t("prisma:tab_report")} />
        <Tab label={t("prisma:tab_charts")} />
      </Tabs>

      <TabPanel value={tab} index={0} dir={theme.direction}>
        <PrismaEditor {...apiData} />
      </TabPanel>

      <TabPanel value={tab} index={1} dir={theme.direction}>
        <PrismaReport {...apiData} />
      </TabPanel>

      <TabPanel value={tab} index={2} dir={theme.direction}>
        <PrismaCharts {...apiData} />
      </TabPanel>
    </Box>
  );
};