import { useState, useEffect } from "react";
import {
    Box,
    Button,
    IconButton,
    Typography,
    List,
    ListItem,
    ListItemText,
    Autocomplete,
    TextField
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { TitlesGroups, TitleToExclude } from "../types";
import { v4 as uuidv4 } from 'uuid';
import "../../styles/components/manageGroupsModal.scss"
import { useTranslation } from "react-i18next";

interface DependenciesModalProps {
    titles: TitleToExclude[];
    groups: TitlesGroups[];
    isOpen: boolean;
    onClose: () => void;
    onGroupsUpdate: (groups: TitlesGroups[], newTitles?: TitleToExclude[]) => void;
}

export const DependenciesModal = ({
    titles,
    groups,
    isOpen,
    onClose,
    onGroupsUpdate
}: DependenciesModalProps) => {
    const { t } = useTranslation();
    const [titlesGroups, setTitlesGroups] = useState<TitlesGroups[]>([]);
    const [searchTitlesGroups, setSearchTitlesGroups] = useState<TitlesGroups[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>();
    const [newTitles, setNewTitles] = useState<Record<string, string[]>>({});

    useEffect(() => {
        setTitlesGroups(groups);

        let filteredGroups: TitlesGroups[] = groups;
        if (searchTerm) {
            filteredGroups = titlesGroups.filter(group =>
                group.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setSearchTitlesGroups(filteredGroups);
    }, [groups]);

    const addTitlesToGroup = (groupId: string) => {
        const titlesList = newTitles[groupId] || [];
        if (!titlesList.length) return;

        const group = titlesGroups.find(g => g.id === groupId);
        if (!group) return;

        const idsToAdd: string[] = [];
        const createdTitles: TitleToExclude[] = [];

        titlesList.map(item => {
            const title = titles.find(t => t.title === item);
            if (title) {
                idsToAdd.push(title.id);
            } else {
                const t: TitleToExclude = {
                    id: uuidv4(),
                    title: item
                }

                createdTitles.push(t);
                idsToAdd.push(t.id);
            }
        })

        const updatedGroups = titlesGroups.map(g =>
            g.id === groupId ? { ...g, titles: [...g.titles, ...idsToAdd] } : g
        );

        setTitlesGroups(updatedGroups);
        onGroupsUpdate(updatedGroups, createdTitles);

        setNewTitles({ ...newTitles, [groupId]: [] });
    };

    const removeTitleFromGroup = (groupId: string, titleId: string) => {
        const updatedGroups = titlesGroups.map(g =>
            g.id === groupId ? { ...g, titles: g.titles.filter(id => id !== titleId) } : g
        );

        setTitlesGroups(updatedGroups);
        onGroupsUpdate(updatedGroups);
    };

    const getAutocompleteOptions = (group: TitlesGroups) => {
        return titles.filter(t => !group.titles.includes(t.id));
    };

    const onSearchValueChange = (searchTerm: string) => {
        const filteredGroups = titlesGroups.filter(group =>
            group.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setSearchTerm(searchTerm);
        setSearchTitlesGroups(filteredGroups);
    }

    if (!isOpen) return null;

    return (
        <Box className="mg-overlay" onClick={onClose}>
            <Box className="mg-container" onClick={(e) => e.stopPropagation()}>

                <Box className="mg-header">
                    <Typography variant="h6" className="mg-title">{t("dependenciesModal:manageGroups") || "Manage Groups"}</Typography>

                    <IconButton onClick={onClose} className="mg-close-btn">
                        <CloseIcon />
                    </IconButton>
                </Box>

                <TextField
                    className="search-field"
                    label={t("home:botao_pesquisar") || "Search"}
                    variant="standard"
                    onChange={(e) => onSearchValueChange(e.target.value)}
                    placeholder={t("configurations:enterGroupName") || "Introduce the group name"} />

                {searchTitlesGroups.map(group => (
                    <Box key={group.id} className="mg-group-card">

                        <Typography variant="subtitle1" className="mg-group-name">
                            {group.name}
                        </Typography>

                        <List dense className="mg-titles-list">
                            {group.titles.map(titleId => {
                                const titleObj = titles.find(t => t.id === titleId);
                                if (!titleObj) return null;

                                return (
                                    <ListItem
                                        key={titleId}
                                        className="mg-title-item"
                                        secondaryAction={
                                            <IconButton
                                                edge="end"
                                                onClick={() => removeTitleFromGroup(group.id, titleId)}
                                                className="mg-delete-btn"
                                                title={t("savedsearchcard:delete") || "Delete"}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        }
                                    >
                                        <ListItemText primary={titleObj.title} />
                                    </ListItem>
                                );
                            })}
                        </List>

                        <Box className="mg-add-row">
                            <Autocomplete
                                freeSolo
                                multiple
                                options={getAutocompleteOptions(group).map(t => t.title)}
                                value={newTitles[group.id] ?? []}
                                onChange={(e, value) =>
                                    setNewTitles(prev => ({ ...prev, [group.id]: value }))
                                }
                                renderInput={(params) => (
                                    <TextField {...params} size="small" placeholder={t("saveDialogMultipleInputs:header") || "Add Titles"} />
                                )}
                                className="mg-autocomplete"
                            />

                            <Button
                                variant="outlined"
                                onClick={() => addTitlesToGroup(group.id)}
                                className="mg-add-btn"
                                title={t("home:botao_adicionar") || "Add"}
                            >
                                <AddIcon fontSize="small" />
                            </Button>
                        </Box>

                    </Box>
                ))}

                <Box className="mg-footer">
                    <Button variant="outlined" onClick={onClose} className="mg-close-footer-btn">
                        {t("import:close") || "Close"}
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};
