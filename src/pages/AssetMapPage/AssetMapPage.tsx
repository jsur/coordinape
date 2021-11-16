import { useEffect, useMemo } from 'react';

import { useHistory, useLocation } from 'react-router-dom';
import { useRecoilCallback, useRecoilValue } from 'recoil';

import { makeStyles } from '@material-ui/core';

import {
  useMapEpochs,
  useStateAmEpochId,
  useStateAmMetric,
  useSelectedCircle,
  useSetAmEgoAddress,
  rTriggerMode,
} from 'recoilState';
import { MAP_HIGHLIGHT_PARAM } from 'routes/paths';

import { AMDrawer } from './AMDrawer';
import { AMForceGraph } from './AMForceGraph';
import { RedSelect } from './RedSelect';

import { MetricEnum } from 'types';

const useStyles = makeStyles(theme => ({
  root: {
    position: 'relative',
    height: '100%',
  },
  controls: {
    padding: theme.spacing(2, 4),
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    '& > *': {
      marginRight: theme.spacing(4),
    },
  },
}));

interface MetricOption {
  label: string;
  value: MetricEnum;
}

export const AssetMapPage = () => {
  const classes = useStyles();
  const location = useLocation();
  const history = useHistory();
  const setAmEgoAddress = useSetAmEgoAddress();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const newAddress = queryParams.get(MAP_HIGHLIGHT_PARAM);
    if (newAddress) {
      setAmEgoAddress(newAddress);
      queryParams.delete(MAP_HIGHLIGHT_PARAM);
      history.replace({
        search: queryParams.toString(),
      });
    }
  }, [location]);

  const amEpochs = useMapEpochs();
  const [amEpochId, setAmEpochId] = useStateAmEpochId();
  const [metric, setMetric] = useStateAmMetric();
  const { circle } = useSelectedCircle();
  const showHiddenFeatures = useRecoilValue(rTriggerMode);

  const metricOptions = [
    {
      label: `Number of ${circle.tokenName} received`,
      value: 'give',
    },
    {
      label: 'In Degree (# incoming links)',
      value: 'in_degree',
    },
    {
      label: 'Out Degree (# outgoing links)',
      value: 'out_degree',
    },
    {
      label: `Degree Standardization (${circle.tokenName} * #outDeg / #maxOutDeg)`,
      value: 'standardized',
    },
  ] as MetricOption[];

  // This is the AssetMapPage Controller
  useEffect(() => {
    if (amEpochs.length === 0) {
      return;
    }
    setAmEpochId(amEpochs[amEpochs.length - 1]?.id);
    // TODO: Load gifts for selected epoch when needed:
    // https://linear.app/yearn/issue/APE-192/api-dont-always-load-everything-and-improve-fetching
  }, [amEpochs]);

  const epochOptions = useMemo(() => {
    return amEpochs.length > 0
      ? [
          {
            label: 'ALL',
            value: -1,
          },
        ].concat(
          amEpochs.map(e => ({
            label: e.labelGraph,
            value: e.id,
          }))
        )
      : [];
  }, [amEpochs]);

  if (!epochOptions || amEpochId === undefined) {
    return <div className={classes.root}></div>;
  }

  return (
    <div className={classes.root}>
      <AMDrawer />
      <AMForceGraph />
      <div className={classes.controls}>
        <RedSelect
          value={amEpochId}
          options={epochOptions}
          onChange={v => setAmEpochId(v as number)}
        />
        {showHiddenFeatures && (
          <RedSelect
            value={metric}
            options={metricOptions}
            onChange={v => setMetric(v as MetricEnum)}
          />
        )}
      </div>
      <DevModeInjector />
    </div>
  );
};

const DevModeInjector = () => {
  const setMode = useRecoilCallback(({ set }) => async (active: boolean) => {
    set(rTriggerMode, active);
  });

  useEffect(() => {
    // Setup dev tool: trigger mode
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.mode = setMode;
  }, [setMode]);

  return <></>;
};

export default AssetMapPage;
