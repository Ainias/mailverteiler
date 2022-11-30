import {NextPage} from "next";
import {prepareConnection} from "../typeorm/prepareConnection";

export function prepareInitialProps<Type>(getInitialProps: NextPage<Type>["getInitialProps"]){
    return async (...args: Parameters<NextPage["getInitialProps"]>) => {
        await prepareConnection();
        console.log("LOG-d prepared Connection!");
        return getInitialProps(...args);
    }
}
