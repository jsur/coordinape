import React, { useMemo } from 'react';

import clsx from 'clsx';
import { groupBy, toPairs } from 'lodash';
import { NavLink } from 'react-router-dom';
import { useRecoilValueLoadable } from 'recoil';

import { Popover, makeStyles, Divider } from '@material-ui/core';

import { ApeAvatar } from 'components';
import { useApiBase } from 'hooks';
import {
  useMyProfile,
  rSelectedCircleState,
  useSetCircleSelectorOpen,
  useEpochsStatus,
} from 'recoilState';
import * as paths from 'routes/paths';

import { ICircle } from 'types';

const useStyles = makeStyles(theme => ({
  avatarButton: {
    marginLeft: theme.spacing(1.5),
    height: '50px',
    width: '50px',
    cursor: 'pointer',
    border: '3px solid #828F93',
    transition: 'border-color .3s ease',
    '&.selected': {
      border: '3px solid rgba(239, 115, 118, 1)',
    },
    '&:hover': {
      border: '3px solid rgba(239, 115, 118, 1)',
    },
  },
  popover: {
    width: 237,
    marginTop: theme.spacing(0.5),
    padding: theme.spacing(2, 0),
    borderRadius: 8,
    background:
      'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(223, 237, 234, 0.4) 40.1%), linear-gradient(180deg, rgba(237, 253, 254, 0.4) 0%, rgba(207, 231, 233, 0) 100%), #FFFFFF',
    boxShadow: '0px 4px 6px rgba(181, 193, 199, 0.16)',
    display: 'flex',
    flexDirection: 'column',
  },
  divider: {
    alignSelf: 'stretch',
    background: theme.colors.text,
    opacity: 0.25,
    margin: theme.spacing(2, 1),
  },
  subHeader: {
    margin: theme.spacing(0.5, 0, 0.5, 5),
    fontSize: 13,
    lineHeight: 1.5,
    fontWeight: 600,
  },
  subSubHeader: {
    fontStyle: 'italic',
    margin: theme.spacing(0.7, 0, 0, 5),
    fontSize: 13,
    lineHeight: 1.5,
    fontWeight: 300,
  },
  link: {
    position: 'relative',
    margin: theme.spacing(0, 0, 0, 5),
    padding: 0,
    textAlign: 'left',
    fontSize: 18,
    lineHeight: 1.6,
    color: theme.colors.text,
    fontWeight: 300,
    textDecoration: 'none',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontFamily: theme.typography.fontFamily,
    '&:hover': {
      color: theme.colors.black,
    },
  },
  selectedLink: {
    '&::before': {
      content: '" "',
      position: 'absolute',
      top: '11px',
      left: '-16px',
      width: '8px',
      height: '8px',
      backgroundColor: theme.colors.red,
      borderRadius: '50%',
    },
  },
  activeLink: {
    color: theme.colors.darkRed,
  },
}));

const CircleButton = ({
  circle,
  selected,
  onClick,
}: {
  circle: ICircle;
  selected: boolean;
  onClick: () => void;
}) => {
  const classes = useStyles();
  const { currentEpoch } = useEpochsStatus(circle.id);

  return (
    <button
      className={clsx(classes.link, {
        [classes.selectedLink]: selected,
        [classes.activeLink]: !!currentEpoch,
      })}
      key={circle.name}
      onClick={onClick}
    >
      {circle.name}
    </button>
  );
};

export const MyAvatarMenu = () => {
  const classes = useStyles();
  const { selectAndFetchCircle } = useApiBase();
  const myProfile = useMyProfile();
  const { hasAdminView, myUsers } = myProfile;
  const setCircleSelectorOpen = useSetCircleSelectorOpen();
  const selectedCircleState = useRecoilValueLoadable(rSelectedCircleState);

  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const groupedCircles = useMemo(
    () =>
      toPairs(
        groupBy(
          myUsers.map(u => u.circle),
          c => c.protocol.name
        )
      ),
    [myUsers]
  );

  const selectedId =
    selectedCircleState.state === 'hasValue'
      ? selectedCircleState.contents?.circle?.id
      : undefined;

  return (
    <>
      <ApeAvatar
        profile={myProfile}
        onClick={handleClick}
        className={
          !anchorEl
            ? classes.avatarButton
            : clsx(classes.avatarButton, 'selected')
        }
      />
      <Popover
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        classes={{
          paper: classes.popover,
        }}
        id="my-avatar-popover"
        onClose={handleClose}
        open={open}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {paths.getMenuNavigation().map(({ label, path, isExternal }) => {
          if (isExternal) {
            return (
              <div key={path}>
                <a
                  className={classes.link}
                  href={path}
                  rel="noreferrer"
                  target="_blank"
                >
                  {label}
                </a>
              </div>
            );
          }
          return (
            <NavLink
              key={path}
              to={path}
              className={classes.link}
              onClick={() => setAnchorEl(null)}
            >
              {label}
            </NavLink>
          );
        })}
        <Divider variant="middle" className={classes.divider} />
        <span className={classes.subHeader}>Switch Circles</span>
        {groupedCircles.map(([protocolName, circles], idx) => (
          <React.Fragment key={idx}>
            <span className={classes.subSubHeader}>{protocolName}</span>
            {circles.map(circle => (
              <CircleButton
                key={circle.id}
                circle={circle}
                selected={selectedId === circle.id}
                onClick={() => {
                  setAnchorEl(null);
                  selectedCircleState?.contents?.circle?.id !== circle.id &&
                    selectAndFetchCircle(circle.id);
                }}
              />
            ))}
          </React.Fragment>
        ))}
        {hasAdminView && (
          <>
            <Divider variant="middle" className={classes.divider} />
            <span className={classes.subHeader}>Admin View</span>
            {selectedCircleState.state === 'hasValue' ? (
              <>
                <button
                  className={clsx(classes.link, classes.selectedLink)}
                  onClick={() => setAnchorEl(null)}
                >
                  {selectedCircleState.contents.circle.name}
                </button>
                <button
                  className={classes.link}
                  onClick={() => {
                    setAnchorEl(null);
                    setCircleSelectorOpen(true);
                  }}
                >
                  More...
                </button>
              </>
            ) : (
              <button
                className={classes.link}
                onClick={() => {
                  setAnchorEl(null);
                  setCircleSelectorOpen(true);
                }}
              >
                Circle Selector
              </button>
            )}
          </>
        )}
      </Popover>
    </>
  );
};
