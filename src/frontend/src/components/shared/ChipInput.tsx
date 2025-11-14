import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";

type Props = {
    label: string;
    values: string[];
    setValues: (v: string[]) => void;
    placeholder?: string;
};

export function ChipInput({
    label,
    values,
    setValues,
    placeholder = "",
}: Props) {
    return (
        <Autocomplete
            multiple
            freeSolo
            options={[]}
            value={values}
            onChange={(_e, newValue) => setValues(newValue as string[])}
            filterSelectedOptions
            renderTags={(tagValue, getTagProps) =>
                tagValue.map((option, index) => (
                    <Chip
                        {...getTagProps({ index })}
                        key={`${option}-${index}`}
                        label={option}
                        sx={{
                            bgcolor: "#3a3a3a",
                            color: "#000",
                            border: "1px solid #555",
                            "& .MuiChip-deleteIcon": {
                                color: "#222",
                                "&:hover": { color: "#555" },
                            },
                            "& .MuiSvgIcon-root": {
                                color: "#fff"
                            }
                        }}
                    />
                ))
            }
            renderInput={(params) => (
                <TextField
                    {...params}
                    variant="filled"
                    fullWidth
                    label={label}
                    placeholder={values.length ? "" : placeholder}
                    onBlur={() => {
                        const raw = params.inputProps.value?.toString().trim();

                        if (raw) {
                            const updated = Array.from(new Set([...values, raw]));
                            setValues(updated);
                        }

                        params.inputProps.value = "";
                    }}
                    sx={{
                        width: "100%",
                        "& .MuiFilledInput-root": {
                            backgroundColor: "#222",
                            color: "#000",
                            borderRadius: "4px",
                            "&:after": { borderBottomColor: "#000" },
                        },
                        "& .MuiFormLabel-root": {
                            color: "#fff",
                        },
                        "& .MuiFormLabel-root.Mui-focused": {
                            color: "#fff",
                        },
                        "& .MuiAutocomplete-clearIndicator": {
                            color: "#fff"
                        },
                        "& .MuiInputBase-root": {
                            paddingBottom: "4px",
                        }
                    }}
                />
            )}
            sx={{
                width: "100%",
                "& .MuiChip-root": { m: "4px 4px 0 0" },
            }}
        />
    );
}
