``/*
 * Copyright 2020 Spotify AB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// TODO(blam): Remove this implementation when the Tabs are ready
// This is just a temporary solution to implementing tabs for now

import React, { useState, useEffect, ReactElement, ComponentType } from 'react';
import { makeStyles, Tabs, Tab as TabUI, Popover, List, ListItemTextProps, ListItem, ListItemText, ListItemIcon } from '@material-ui/core';
import ArrowDropDown from '@material-ui/icons/ArrowDropDown';

const useStyles = makeStyles(theme => ({
  tabsWrapper: {
    gridArea: 'pageSubheader',
    backgroundColor: theme.palette.background.paper,
    paddingLeft: theme.spacing(3),
  },
  defaultTab: {
    padding: theme.spacing(3, 3),
    ...theme.typography.caption,
    textTransform: 'uppercase',
    fontWeight: 'bold',
    color: theme.palette.text.secondary,
  },
  selected: {
    color: theme.palette.text.primary,
  },
}));

export type Tab = {
  id: string;
  label: string;
};

type HeaderTabsProps = {
  tabs: Tab[];
  onChange?: (index: number) => void;
  selectedIndex?: number;
};

type ActionItemProps = {
  label?: ListItemTextProps['primary'];
  secondaryLabel?: ListItemTextProps['secondary'];
  icon?: ReactElement;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  WrapperComponent?: ComponentType;
};

const ActionItem = ({
  label,
  secondaryLabel,
  icon,
  disabled = false,
  onClick,
  WrapperComponent = React.Fragment,
}: ActionItemProps) => {
  return (
    <WrapperComponent>
      <ListItem
        data-testid="header-action-item"
        disabled={disabled}
        button
        onClick={event => {
          if (onClick) {
            onClick(event);
          }
        }}
      >
        {icon && <ListItemIcon>{icon}</ListItemIcon>}
        <ListItemText primary={label} secondary={secondaryLabel} />
      </ListItem>
    </WrapperComponent>
  );
};

export const HeaderTabs = ({
  tabs,
  onChange,
  selectedIndex,
}: HeaderTabsProps) => {
  const [selectedTab, setSelectedTab] = useState<number>(selectedIndex ?? 0);
  const [open, setOpen] = React.useState(false);
  const [anchorElRef, setAnchorElRef] = React.useState(null);
  const styles = useStyles();

  const handleChange = (_: React.ChangeEvent<{}>, index: number) => {
    if (selectedIndex === undefined) {
      setSelectedTab(index);
    }
    if (onChange) onChange(index);
  };



  useEffect(() => {
    if (selectedIndex !== undefined) {
      setSelectedTab(selectedIndex);
    }
  }, [selectedIndex]);

  return (
    <div className={styles.tabsWrapper}>
      <Tabs
        indicatorColor="primary"
        textColor="inherit"
        variant="scrollable"
        scrollButtons="auto"
        aria-label="scrollable auto tabs example"
        onChange={handleChange}
        value={selectedTab}
      >
        {tabs.map((tab, index) => (
          <TabUI
            label={tab.label}
            key={tab.id}
            value={index}
            className={styles.defaultTab}
            classes={{ selected: styles.selected }}
            icon={<ArrowDropDown onClick={(event) => { setOpen(true); setAnchorElRef(event.currentTarget) }}
              />
            }
          />
        ))}
      </Tabs>
      <Popover
        open={open}
        anchorEl={anchorElRef}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        onClose={() => setOpen(false)}
      >
        <List>
          {tabs.map((actionItem, i) => {
            return (
              <ActionItem key={`header-action-menu-${i}`} {...actionItem} />
            );
          })}
        </List>
      </Popover>
    </div>
  );
};
