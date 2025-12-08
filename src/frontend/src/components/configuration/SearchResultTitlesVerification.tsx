import { useEffect, useState } from "react";
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
import { SnackbarToast } from "../SnackbarToast";
import { ConfirmDialog } from "../ConfirmDialog";

export const loadTitles = (): TitleToExclude[] => {
    const raw = localStorage.getItem("titlesToExclude");
    if (!raw) return [];

    try {
        const parsedTitles = JSON.parse(raw) as TitleToExclude[];
        return parsedTitles
    } catch (error: any) {
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
    } catch (error: any) {
        console.error("Erro ao carregar os grupos de titulos a ser excluidos", error);
    }

    return [];
}

const GROUPS_KEY = "titlesGroups";
const TITLES_KEY = "titlesToExclude";

export const SearchResultTitlesVerification = () => {
    const { t } = useTranslation();

    const [titlesToVerify, setTitlesToVerify] = useState<TitleToExclude[]>(() => loadTitles());
    const [titlesGroups, setTitlesGroups] = useState<TitlesGroups[]>(() => loadGroups());
    const [searchTitlesToVerify, setSearchTitlesToVerify] = useState<TitleToExclude[]>([]);
    const [searchTitlesGroups, setSearchTitlesGroups] = useState<TitlesGroups[]>([]);
    const [isListView, setIsListView] = useState<boolean>(true);
    const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
    const [isSaveDialogMultipleInputsOpen, setIsSaveDialogMultipleInputsOpen] = useState(false);
    const [saveError, setSaveError] = useState<string>("");
    const [isRowEditMode, setRowEditMode] = useState<string>();
    const [editTitles, setEditTitles] = useState<{ [id: string]: string }>({});
    const [editGroups, setEditGroups] = useState<{ [id: string]: string }>({});
    const [isDependenciesModalOpen, setDependenciesModalOpen] = useState(false);
    const [expandedRowsIds, setExpandedRowsIds] = useState<string[]>([]);
    const [openToastD, setOpenToastD] = useState(false);
    const [openToastC, setOpenToastC] = useState(false);
    const [isConfirmDeleteTitleOpen, setIsConfirmDeleteTitleOpen] = useState(false);
    const [isConfirmDeleteGroupOpen, setIsConfirmDeleteGroupOpen] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

    useEffect(() => {
        setSearchTitlesToVerify(titlesToVerify);
        setSearchTitlesGroups(titlesGroups);
    }, [titlesToVerify, titlesGroups]);

    useEffect(() => {
        setRowEditMode("");
        setEditTitles({});
        setEditGroups({})
    }, [isListView]);

    const saveTitles = (titles: string[]) => {
        const newTitles: TitleToExclude[] = titles.map(title => ({
            id: uuidv4(),
            title,
        }));

        const updatedTitles = titlesToVerify.concat(newTitles);
        setTitlesToVerify(updatedTitles);
        localStorage.setItem(TITLES_KEY, JSON.stringify(updatedTitles));
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

        localStorage.setItem(TITLES_KEY, JSON.stringify(updatedTitles));
        localStorage.setItem(GROUPS_KEY, JSON.stringify(updatedGroups));

        loadTitles();
        loadGroups();
        setOpenToastC(true);
    }


    const updateTitle = () => {
        try {
            const updatedTitles = titlesToVerify.map(title => ({
                ...title,
                title: editTitles[title.id] ?? title.title,
            }));
            setTitlesToVerify(updatedTitles);
            localStorage.setItem(TITLES_KEY, JSON.stringify(updatedTitles));
            setEditTitles({});
            setRowEditMode("");

            loadTitles();
            setOpenToastC(true);
        } catch (error: any) {
            console.log(error);
            setOpenToastD(true);

        }
    };

    const updateGroup = () => {
        try {
            const updatedGroups = titlesGroups.map(group => ({
                ...group,
                name: editGroups[group.id] ?? group.name,
            }));
            setTitlesGroups(updatedGroups);
            localStorage.setItem(GROUPS_KEY, JSON.stringify(updatedGroups));
            setEditGroups({});
            setRowEditMode("");

            loadGroups();
            setOpenToastC(true);
        } catch (error: any) {
            console.log(error);
            setOpenToastD(true);

        }
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
        localStorage.setItem(GROUPS_KEY, JSON.stringify(updatedGroups));

        loadGroups();
    }

    const deleteGroup = (id: string) => {
        const updatedGroups = titlesGroups.filter(item => item.id !== id);
        setTitlesGroups(updatedGroups);
        localStorage.setItem(GROUPS_KEY, JSON.stringify(updatedGroups));

        loadGroups();
        setOpenToastC(true);
    }

    const handleSaveGroup = (groupName: string) => {
        try {
            saveGroups(groupName);
            setIsSaveDialogOpen(false);
            setSaveError("");
            setOpenToastC(true);
        } catch (error: any) {
            console.error("Error saving search:", error);
            setSaveError(error);
            setOpenToastD(true);
        }
    }

    const handleSaveTitles = (titles: string[]) => {
        try {

            saveTitles(titles);
            setIsSaveDialogMultipleInputsOpen(false);
            setSaveError("");
            setOpenToastC(true);
        }
        catch (error: any) {
            console.error("Error saving search:", error);
            setSaveError(error);
            setOpenToastD(true);
        }
    }

    const save = () => {
        setSaveError("");
        setIsSaveDialogOpen(true);
    }

    const saveMultipleTitles = () => {
        setSaveError("");
        setIsSaveDialogMultipleInputsOpen(true)
    }

    const saveGroupsLinksWithTitles = (updatedGroups: TitlesGroups[], newTitles?: TitleToExclude[]) => {
        try {
            setTitlesGroups(updatedGroups);
            localStorage.setItem(GROUPS_KEY, JSON.stringify(updatedGroups));
            loadGroups();

            if (newTitles) {
                const updatedTitles = [...titlesToVerify, ...newTitles];
                setTitlesToVerify(updatedTitles);
                localStorage.setItem(TITLES_KEY, JSON.stringify(updatedTitles));
                loadTitles();
            }
            setSaveError("");
            setOpenToastC(true);
        } catch (error: any) {
            console.error("Error saving search:", error);
            setSaveError(error);
            setOpenToastD(true);
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

    const onSearchValueChange = (searchTerm: string) => {
        if (isListView) {
            const filteredTitles = titlesToVerify.filter(title =>
                title.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setSearchTitlesToVerify(filteredTitles);
        } else {
            const filteredGroups = titlesGroups.filter(group =>
                group.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setSearchTitlesGroups(filteredGroups);
        }
    }

    const handleTitleDelete = (id: string) => {
        setDeleteTargetId(id);
        setIsConfirmDeleteTitleOpen(true);
    };

    const handleGroupDelete = (id: string) => {
        setDeleteTargetId(id);
        setIsConfirmDeleteGroupOpen(true);
    };

    const confirmDeleteTitle = () => {
        try {
            if (deleteTargetId) {
                deleteTitle(deleteTargetId);
                loadGroups();
                loadTitles();
            }
            setIsConfirmDeleteTitleOpen(false);
            setDeleteTargetId(null);
            setOpenToastC(true);
        } catch (error) {
            console.log(error)
            setOpenToastD(true);
        }

    };

    const cancelDeleteTitle = () => {
        setIsConfirmDeleteTitleOpen(false);
        setDeleteTargetId(null);
    };

    const confirmDeleteGroup = () => {
        try {
            if (deleteTargetId) {
                deleteGroup(deleteTargetId);
                loadGroups();
                loadTitles();
            }
            setIsConfirmDeleteGroupOpen(false);
            setDeleteTargetId(null);
            setOpenToastC(true);
        } catch (error: any) {
            console.log(error);
            setOpenToastD(true);

        }
    };

    const cancelDeleteGroup = () => {
        setIsConfirmDeleteGroupOpen(false);
        setDeleteTargetId(null);
    };

    return (
        <>
            <ConfirmDialog
                isOpen={isConfirmDeleteTitleOpen}
                message={
                    t("favorites:confirm_delete") ||
                    "Are you sure you want to delete this search?"
                }
                onConfirm={confirmDeleteTitle}
                onCancel={cancelDeleteTitle}
            />

            <ConfirmDialog
                isOpen={isConfirmDeleteGroupOpen}
                message={
                    t("favorites:confirm_delete") ||
                    "Are you sure you want to delete this search?"
                }
                onConfirm={confirmDeleteGroup}
                onCancel={cancelDeleteGroup}
            />
            <SnackbarToast
                open={openToastD}
                setOpen={setOpenToastD}
                messageStr={t("warnings:error")}
                type="error"
            />

            <SnackbarToast
                open={openToastC}
                setOpen={setOpenToastC}
                messageStr={t("warnings:success")}
                type="success"
            />

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
                onClose={() => setIsSaveDialogMultipleInputsOpen(false)}
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
            <Box className="titles-verification-action-buttons">
                <IconButton className="action-button" size="small" aria-label="list view" title="List View" onClick={() => setIsListView(true)}>
                    <ViewListIcon />
                </IconButton>

                <IconButton className="action-button" size="small" aria-label="grouped view" title="Grouped View" onClick={() => setIsListView(false)}>
                    <ViewModuleIcon />
                </IconButton>

                <IconButton className="action-button" size="small" aria-label="add title" title="Add Title" onClick={saveMultipleTitles}>
                    <AddIcon />
                </IconButton>

                <IconButton className="action-button" size="small" aria-label="add group" title="Add Group" onClick={save}>
                    <GroupAddIcon />
                </IconButton>

                <IconButton className="action-button" size="small" aria-label="add link" title="Manage links" onClick={() => setDependenciesModalOpen(true)}>
                    <AddLinkIcon />
                </IconButton>

                <TextField
                    className="search-field"
                    onChange={(e) => onSearchValueChange(e.target.value)}
                    label="Search"
                    variant="standard"
                    placeholder={isListView ? "Introduce the title name" : "Introduce the group name"} />
            </Box>
            <Box className="list-box">
                {isListView ?
                    <List className="titles-list">
                        {searchTitlesToVerify.map((item) =>
                            <ListItem
                                key={item.id}
                                className="title-item"
                                secondaryAction={
                                    <Box className="actions-box" sx={{ display: "flex", gap: 1 }}>
                                        <IconButton size="small" className="action-btn edit-btn" style={{ display: item.id === isRowEditMode ? 'none' : 'initial' }}>
                                            <EditIcon onClick={() => setRowEditMode(item.id)} />
                                        </IconButton>
                                        <IconButton size="small" className="action-btn delete-btn" style={{ display: item.id === isRowEditMode ? 'none' : 'initial' }} onClick={() => handleTitleDelete(item.id)}>
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
                                                className="group-edit-input"
                                                variant="standard"
                                                value={editTitles[item.id] === undefined ? item.title : editTitles[item.id]}
                                                onChange={(e) => setEditTitles(prev => ({ ...prev, [item.id]: e.target.value }))}
                                                onBlur={(e) => setEditTitles(prev => ({ ...prev, [item.id]: e.target.value || item.title }))}
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
                        {searchTitlesGroups.map((item) =>
                            <Box key={item.id} className="group-box">
                                <ListItem
                                    className="group-item"
                                    secondaryAction={
                                        <Box className="actions-box" sx={{ display: "flex", gap: 1 }}>
                                            <IconButton size="small" className="action-btn edit-btn" style={{ display: item.id === isRowEditMode ? 'none' : 'initial' }}>
                                                <EditIcon onClick={() => setRowEditMode(item.id)} />
                                            </IconButton>
                                            <IconButton size="small" className="action-btn delete-btn" style={{ display: item.id === isRowEditMode ? 'none' : 'initial' }} onClick={() => handleGroupDelete(item.id)}>
                                                <DeleteIcon />
                                            </IconButton>
                                            <IconButton size="small" className="action-btn save-btn" style={{ display: item.id === isRowEditMode ? 'initial' : 'none' }} onClick={() => updateGroup()}>
                                                <CheckIcon />
                                            </IconButton>
                                            <IconButton size="small" className="action-btn cancel-btn" style={{ display: item.id === isRowEditMode ? 'initial' : 'none' }} onClick={() => setRowEditMode("")}>
                                                <CloseIcon />
                                            </IconButton>

                                            <IconButton
                                                hidden={item.titles.length === 0}
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
                                                    variant="standard"
                                                    value={editGroups[item.id] === undefined ? item.name : editGroups[item.id]}
                                                    onChange={(e) => setEditGroups(prev => ({ ...prev, [item.id]: e.target.value }))}
                                                    onBlur={(e) => setEditGroups(prev => ({ ...prev, [item.id]: e.target.value || item.name }))}
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
                                                    Creation date: {item.creationDate.toLocaleString()}
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
            </Box>
        </>
    )
}