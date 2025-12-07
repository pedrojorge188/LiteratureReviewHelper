import { useState } from "react";
import { TitlesGroups, TitleToExclude } from "../types";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import FolderIcon from '@mui/icons-material/Folder';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import ViewListIcon from "@mui/icons-material/ViewList";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import AddIcon from "@mui/icons-material/Add";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import LabelIcon from "@mui/icons-material/Label";
import Typography from "@mui/material/Typography";
import { SaveDialog } from "../SaveDialog";
import { v4 as uuidv4 } from 'uuid';
import { SaveDialogMultipleInputs } from "../SaveDialogMultipleInputs";
import AddLinkIcon from '@mui/icons-material/AddLink';
import { Collapse, TextField } from "@mui/material";
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { DependenciesModal } from "./DependenciesModal";
import { useTranslation } from "react-i18next";
import "../../styles/components/titleVerification.scss";

export const loadTitles = (): TitleToExclude[] => {
    const raw = localStorage.getItem("titlesToExclude");
    if (!raw) return [];

    try {
        const parsedTitles = JSON.parse(raw) as TitleToExclude[];
        return parsedTitles
    } catch (error) {
        console.error("Erro ao carregar os titulos a ser excluidos", error);
    }

    return [];
}

export const loadGroups = (): TitlesGroups[] => {
    const raw = localStorage.getItem("titlesGroups");
    if (!raw) return [];

    try {
        const parsed = JSON.parse(raw);

        const parsedGroups = parsed.map((group: any) => ({
            ...group,
            creationDate: new Date(group.creationDate),
        })) as TitlesGroups[];

        return parsedGroups
    } catch (error) {
        console.error("Erro ao carregar os grupos de titulos a ser excluidos", error);
    }

    return [];
}

export const SearchResultTitlesVerification = () => {
    const { t } = useTranslation();

    const [titlesToVerify, setTitlesToVerify] = useState<TitleToExclude[]>(() => loadTitles());
    const [titlesGroups, setTitlesGroups] = useState<TitlesGroups[]>(() => loadGroups());
    const [isListView, setIsListView] = useState<boolean>(true);
    const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
    const [isSaveDialogMultipleInputsOpen, setisSaveDialogMultipleInputsOpen] = useState(false);
    const [saveError, setSaveError] = useState<string>("");
    const [isRowEditMode, setRowEditMode] = useState<string>();
    const [editTitles, setEditTitles] = useState<{ [id: string]: string }>({});
    const [isDependenciesModalOpen, setDependenciesModalOpen] = useState(false);
    const [expandedRowsIds, setExpandedRowsIds] = useState<string[]>([]);


    const saveTitles = (titles: string[]) => {
        const newTitles: TitleToExclude[] = titles.map(title => ({
            id: uuidv4(),
            title,
        }));

        const updatedTitles = titlesToVerify.concat(newTitles);
        setTitlesToVerify(updatedTitles);
        localStorage.setItem("titlesToVerify", JSON.stringify(updatedTitles));
        loadTitles();
    }

    const deleteTitle = (titleId: string) => {
        const updatedGroups = titlesGroups.map(group => ({
            ...group,
            titles: group.titles.filter(id => id !== titleId)
        }));

        const updatedTitles = titlesToVerify.filter(item => item.id !== titleId);
        setTitlesToVerify(updatedTitles);
        setTitlesGroups(updatedGroups);

        localStorage.setItem("titlesToVerify", JSON.stringify(updatedTitles));
        localStorage.setItem("titlesGroups", JSON.stringify(updatedGroups));

        loadTitles();
        loadGroups();
    }


    const updateTitle = () => {
        const updatedTitles = titlesToVerify.map(title => ({
            ...title,
            title: editTitles[title.id] ?? title.title,
        }));
        setTitlesToVerify(updatedTitles);
        localStorage.setItem("titlesToVerify", JSON.stringify(updatedTitles));
        setEditTitles({});
        setRowEditMode("");

        loadTitles();
    };

    const updateGroup = () => {
        const updatedGroups = titlesGroups.map(group => ({
            ...group,
            name: editTitles[group.id] ?? group.name,
        }));
        setTitlesGroups(updatedGroups);
        localStorage.setItem("titlesGroups", JSON.stringify(updatedGroups));
        setEditTitles({});
        setRowEditMode("");

        loadGroups();
    };

    const saveGroups = (groupName: string) => {
        const group: TitlesGroups = {
            id: uuidv4(),
            name: groupName,
            creationDate: new Date(),
            titles: [],
        };

        const updatedGroups = [...titlesGroups, group];
        setTitlesGroups(updatedGroups);
        localStorage.setItem("titlesGroups", JSON.stringify(updatedGroups));

        loadGroups();
    }

    const deleteGroup = (id: string) => {
        const updatedGroups = titlesGroups.filter(item => item.id !== id);
        setTitlesGroups(updatedGroups);
        localStorage.setItem("titlesGroups", JSON.stringify(updatedGroups));

        loadGroups();
    }

    const handleSaveGroup = (groupName: string) => {
        try {
            saveGroups(groupName);
            setIsSaveDialogOpen(false);
            setSaveError("");
        } catch (error) {
            console.error("Error saving search:", error);
            // Set error message to be displayed in the dialog
            if (error instanceof Error) {
                setSaveError(error.message);
            } else {
                setSaveError(
                    t("home:search_save_error") ||
                    "Error saving search. Please try again."
                );
            }
        }
    }

    const handleSaveTitles = (titles: string[]) => {
        try {
            saveTitles(titles);
            setisSaveDialogMultipleInputsOpen(false);
            setSaveError("");
        } catch (error) {
            console.error("Error saving search:", error);
            // Set error message to be displayed in the dialog
            if (error instanceof Error) {
                setSaveError(error.message);
            } else {
                setSaveError(
                    t("home:search_save_error") ||
                    "Error saving search. Please try again."
                );
            }
        }
    }

    const save = () => {
        setSaveError("");
        setIsSaveDialogOpen(true);
    }

    const saveMultipleTitles = () => {
        setSaveError("");
        setisSaveDialogMultipleInputsOpen(true)
    }

    const saveGroupsLinksWithTitles = (updatedGroups: TitlesGroups[], newTitles?: TitleToExclude[]) => {
        setTitlesGroups(updatedGroups);
        localStorage.setItem("titlesGroups", JSON.stringify(updatedGroups));
        loadGroups();

        if (newTitles) {
            const updatedTitles = [...titlesToVerify, ...newTitles];
            setTitlesToVerify(updatedTitles);
            localStorage.setItem("titlesToVerify", JSON.stringify(updatedTitles));
            loadTitles();
        }
    }

    const getTitlesGroups = (id: string) => {
        const groups = titlesGroups.filter(g => g.titles.includes(id));
        return groups.map(g => g.name).join(", ")
    }

    const getGroupTitles = (titlesIds: string[]) => {
        return titlesToVerify.filter(t => titlesIds.includes(t.id));
    }

    const changeRowState = (id: string) => {
        if (expandedRowsIds.includes(id)) {
            const updatedRowsState = expandedRowsIds.filter(rId => rId !== id);
            setExpandedRowsIds(updatedRowsState);
        } else {
            const updatedRowsState = [...expandedRowsIds, id]
            setExpandedRowsIds(updatedRowsState);
        }
    }

    return (
        <>
            <SaveDialog
                isOpen={isSaveDialogOpen}
                onClose={() => setIsSaveDialogOpen(false)}
                onSave={handleSaveGroup}
                externalError={saveError}
                dialogHeader="Create Group"
                dialogPrompt="Enter the group name"
                dialogPlaceholder="e.g., Aerospace"
            />

            <SaveDialogMultipleInputs
                isOpen={isSaveDialogMultipleInputsOpen}
                onClose={() => setisSaveDialogMultipleInputsOpen(false)}
                onSave={handleSaveTitles}
                externalError={saveError}
            />

            <DependenciesModal
                isOpen={isDependenciesModalOpen}
                onClose={() => setDependenciesModalOpen(false)}
                titles={titlesToVerify}
                groups={titlesGroups}
                onGroupsUpdate={(updatedGroups, createdTitles) => { saveGroupsLinksWithTitles(updatedGroups, createdTitles) }}
            />

            <h3 className="bibliotecas-lista-titulo">
                {t("configurations:sections:verifyResults") || "Verification titles"}
            </h3>
            <Box
                sx={{
                    display: "flex",
                    gap: 2,
                    mb: 2,
                }}
            >
                <Tooltip title="List View">
                    <IconButton aria-label="list view" onClick={() => { setIsListView(true); setRowEditMode(""); setEditTitles({}) }}>
                        <ViewListIcon />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Grouped View">
                    <IconButton aria-label="grouped view" onClick={() => { setIsListView(false); setRowEditMode(""); setEditTitles({}) }}>
                        <ViewModuleIcon />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Add Title">
                    <IconButton aria-label="add title" onClick={saveMultipleTitles}>
                        <AddIcon />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Add Group">
                    <IconButton aria-label="add group" onClick={save}>
                        <GroupAddIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Manage links">
                    <IconButton aria-label="add link" onClick={() => setDependenciesModalOpen(true)}>
                        <AddLinkIcon />
                    </IconButton>
                </Tooltip>
            </Box>
            {isListView ?
                <List className="titles-list">
                    {titlesToVerify.map((item) =>
                        <ListItem
                            key={item.id}
                            className="title-item"
                            sx={{
                                bgcolor: "background.paper",
                                borderRadius: 1,
                                mb: 1,
                                minHeight: 80,
                                display: "flex",
                                alignItems: "center",
                                "&:hover": { bgcolor: "grey.300" }
                            }}
                            secondaryAction={
                                <Box className="actions-box" sx={{ display: "flex", gap: 1 }}>
                                    <IconButton size="small" className="action-btn edit-btn" style={{ display: item.id === isRowEditMode ? 'none' : 'initial' }}>
                                        <EditIcon onClick={() => setRowEditMode(item.id)} />
                                    </IconButton>
                                    <IconButton size="small" className="action-btn delete-btn" style={{ display: item.id === isRowEditMode ? 'none' : 'initial' }} onClick={() => deleteTitle(item.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                    <IconButton size="small" className="action-btn save-btn" style={{ display: item.id === isRowEditMode ? 'initial' : 'none' }} onClick={() => updateTitle()}>
                                        <CheckIcon />
                                    </IconButton>
                                    <IconButton size="small" className="action-btn cancel-btn" style={{ display: item.id === isRowEditMode ? 'initial' : 'none' }} onClick={() => setRowEditMode("")}>
                                        <CloseIcon />
                                    </IconButton>
                                </Box>
                            }
                        >
                            <ListItemIcon className="title-icon">
                                <LabelIcon />
                            </ListItemIcon>

                            <ListItemText
                                className="title-text"
                                primary={
                                    item.id === isRowEditMode ?
                                        <TextField
                                            className="title-edit-input"
                                            style={{ width: '90%' }}
                                            variant="standard"
                                            value={!editTitles[item.id] ? item.title : editTitles[item.id]}
                                            onChange={(e) => setEditTitles(prev => ({ ...prev, [item.id]: e.target.value }))}
                                        />
                                        :
                                        item.title
                                }
                                secondary={
                                    <Typography hidden={item.id === isRowEditMode} component="div" variant="body2" className="title-groups">{getTitlesGroups(item.id)}</Typography>
                                }
                            />
                        </ListItem>,
                    )}
                </List>
                :
                <List className="groups-list">
                    {titlesGroups.map((item) =>
                        <Box key={item.id} className="group-box">
                            <ListItem
                                className="group-item"
                                sx={{
                                    bgcolor: "background.paper",
                                    borderRadius: 1,
                                    mb: 1,
                                    minHeight: 80,
                                    display: "flex",
                                    alignItems: "center",
                                    "&:hover": { bgcolor: "grey.300" }
                                }}
                                secondaryAction={
                                    <Box className="actions-box" sx={{ display: "flex", gap: 1 }}>
                                        <IconButton size="small" className="action-btn edit-btn" style={{ display: item.id === isRowEditMode ? 'none' : 'initial' }}>
                                            <EditIcon onClick={() => setRowEditMode(item.id)} />
                                        </IconButton>
                                        <IconButton size="small" className="action-btn delete-btn" style={{ display: item.id === isRowEditMode ? 'none' : 'initial' }} onClick={() => deleteGroup(item.id)}>
                                            <DeleteIcon />
                                        </IconButton>
                                        <IconButton size="small" className="action-btn save-btn" style={{ display: item.id === isRowEditMode ? 'initial' : 'none' }} onClick={() => updateGroup()}>
                                            <CheckIcon />
                                        </IconButton>
                                        <IconButton size="small" className="action-btn cancel-btn" style={{ display: item.id === isRowEditMode ? 'initial' : 'none' }} onClick={() => setRowEditMode("")}>
                                            <CloseIcon />
                                        </IconButton>

                                        <IconButton
                                            size="small"
                                            className="action-btn expand-btn"
                                            aria-label={expandedRowsIds.includes(item.id) ? "collapse" : "expand"}
                                            onClick={() => changeRowState(item.id)}
                                        >
                                            {expandedRowsIds.includes(item.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                        </IconButton>
                                    </Box>
                                }
                            >
                                <ListItemIcon className="group-icon">
                                    <FolderIcon />
                                </ListItemIcon>

                                <ListItemText
                                    className="group-text"
                                    primary={
                                        item.id === isRowEditMode ?
                                            <TextField
                                                className="group-edit-input"
                                                style={{ width: "90%" }}
                                                variant="standard"
                                                value={!editTitles[item.id] ? item.name : editTitles[item.id]}
                                                onChange={(e) => setEditTitles(prev => ({ ...prev, [item.id]: e.target.value }))}
                                            />
                                            :
                                            item.name
                                    }
                                    secondary={
                                        <Box className="group-secondary" hidden={item.id === isRowEditMode}>
                                            <Typography component="div" variant="body2" className="group-count">
                                                {item.titles.length}
                                            </Typography>
                                            <Typography component="div" variant="body2" className="group-date">
                                                Creation date: {item.creationDate.toLocaleDateString()}
                                            </Typography>
                                        </Box>
                                    }
                                />
                            </ListItem>

                            <Collapse in={expandedRowsIds.includes(item.id)} timeout="auto" unmountOnExit>
                                <List dense className="group-titles-list">
                                    {getGroupTitles(item.titles).map((title) => (
                                        <ListItem
                                            key={`${item.id}-${title.id}`}
                                            className="group-title-item"
                                            component="div"
                                            disableGutters
                                            sx={{
                                                bgcolor: "#fff",
                                                borderRadius: 1,
                                                mb: 1,
                                                minHeight: 50,
                                                display: "flex",
                                                alignItems: "center",
                                            }}
                                        >
                                            <ListItemIcon className="group-title-icon" sx={{ pl: 2 }}>
                                                <LabelIcon />
                                            </ListItemIcon>

                                            <ListItemText
                                                className="group-title-text"
                                                primary={
                                                    <Typography component="div" variant="body2">
                                                        {title.title}
                                                    </Typography>
                                                }
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </Collapse>
                        </Box>
                    )}
                </List>
            }
        </>
    )
}