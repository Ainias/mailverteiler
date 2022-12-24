import React, {useCallback, useMemo, useState} from 'react';
import {
    Block,
    Button,
    Input,
    LoadingArea,
    PasswordInput,
    Select,
    SelectOption,
    withMemo,
    Text
} from 'react-bootstrap-mobile';
import {ListType} from "../../mailman/types/ListType";
import {useT} from "../../hooks/useT";
import {fetcher} from "../../fetcher";


export type ModifyListFormProps = { list?: ListType };

function ModifyListForm({list}: ModifyListFormProps) {
    // Variables
    const {t} = useT();

    // Refs

    // States
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [prefix, setPrefix] = useState("");
    const [password, setPassword] = useState("");
    const [memberAction, setMemberAction] = useState<"accept" | "hold" | "discard">("hold");
    const [nonmemberAction, setNonmemberAction] = useState<"accept" | "hold" | "discard">("hold");
    const [isLoading, setIsLoading] = useState(false);

    const mailActions = useMemo(() => [{
        label: t("mail.action.accept"),
        value: "accept",
    }, {
        label: t("mail.action.hold"),
        value: "hold",
    }, {
        label: t("mail.action.discard"),
        value: "discard"
    }] as SelectOption[], [t]);

    // Selectors

    // Callbacks
    const save = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = {name, description, prefix, password, memberAction, nonmemberAction};
            const result = await fetcher.post("/api/mail/lists", data);
            console.log("LOG-d data", result.data);
        } finally {
            setIsLoading(false);
            // TODO Done action?
        }
    }, [description, memberAction, name, nonmemberAction, password, prefix]);

    // Effects

    // Other

    // Render Functions

    return <LoadingArea loading={isLoading}>
        <Block>
            <Input label={t("modify.list.name")} value={name} onChangeText={setName}/>
        </Block>
        <Block>
            <Input label={t("modify.list.description")} value={description} onChangeText={setDescription}/>
        </Block>
        <Block>
            <Input label={t("modify.list.prefix")} value={prefix} onChangeText={setPrefix}/>
        </Block>
        <Block>
            <PasswordInput label={t("modify.list.password")} value={password} onChangeText={setPassword}/>
            <Button><Text>{t("X")}</Text></Button>
        </Block>
        <Block>
            <Select label={t("modify.list.member-action")} options={mailActions} value={memberAction}
                    onChangeValue={setMemberAction as ((string) => void)}/>
        </Block>
        <Block>
            <Select label={t("modify.list.nonmember-action")} options={mailActions} value={nonmemberAction}
                    onChangeValue={setNonmemberAction as ((string) => void)}/>
        </Block>
        <Block>
            <Button onClick={save}><Text>{t("save")}</Text></Button>
        </Block>
    </LoadingArea>;
}

// Need ModifyListFormMemo for autocompletion of phpstorm
const ModifyListFormMemo = withMemo(ModifyListForm);
export {ModifyListFormMemo as ModifyListForm};
