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
    const [titlesGroups, setTitlesGroups] = useState<TitlesGroups[]>([]);
    const [newTitles, setNewTitles] = useState<Record<string, string[]>>({});

    useEffect(() => {
        setTitlesGroups(groups);
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

    if (!isOpen) return null;

    return (
        <Box
            sx={{
                position: "fixed",
                inset: 0,
                bgcolor: "rgba(0,0,0,0.4)",
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
                overflowY: "auto",
                p: 3,
                zIndex: 1000
            }}
            onClick={onClose}
        >
            <Box
                sx={{
                    bgcolor: "#f5f5f5",
                    borderRadius: 2,
                    width: "100%",
                    maxWidth: 700,
                    p: 4,
                    display: "flex",
                    flexDirection: "column",
                    gap: 3
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="h6">Manage Groups</Typography>
                    <IconButton onClick={onClose} sx={{ color: "#555" }}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                {titlesGroups.map(group => (
                    <Box
                        key={group.id}
                        sx={{
                            bgcolor: "#fff",
                            borderRadius: 1,
                            p: 2,
                            border: "1px solid #ddd",
                            mb: 2,
                            overflow: "visible"
                        }}
                    >
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>
                            {group.name}
                        </Typography>

                        <List dense>
                            {group.titles.map(titleId => {
                                const titleObj = titles.find(t => t.id === titleId);
                                if (!titleObj) return null;

                                return (
                                    <ListItem
                                        key={titleId}
                                        sx={{ bgcolor: "#f0f0f0", borderRadius: 1, mb: 1 }}
                                        secondaryAction={
                                            <IconButton
                                                edge="end"
                                                onClick={() => removeTitleFromGroup(group.id, titleId)}
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

                        <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                            <Autocomplete
                                freeSolo
                                multiple
                                options={getAutocompleteOptions(group).map(t => t.title)}
                                value={newTitles[group.id] ?? []}
                                onChange={(e, value) =>
                                    setNewTitles(prev => ({ ...prev, [group.id]: value }))
                                }
                                renderInput={(params) => (
                                    <TextField {...params} size="small" placeholder="Add titles" />
                                )}
                                sx={{ flex: 1 }}
                            />
                            <Button
                                variant="outlined"
                                onClick={() => addTitlesToGroup(group.id)}
                                sx={
                                    {
                                        whiteSpace: "nowrap",
                                        color: "#555",
                                        borderColor: "#555",
                                        "&:hover":
                                        {
                                            bgcolor: "grey.200",
                                            borderColor: "grey.600"
                                        }
                                    }
                                }
                            >
                                <AddIcon fontSize="small" />
                            </Button>
                        </Box>
                    </Box>
                ))}

                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button
                        variant="outlined"
                        onClick={onClose}
                        sx={
                            {
                                color: "#555",
                                borderColor: "#555",
                                "&:hover":
                                {
                                    bgcolor: "grey.200",
                                    borderColor: "grey.600"
                                }
                            }
                        }
                    >
                        Close
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};
