import { CredentialFormSchema } from "@/api/graphql/model-provider/types/model-provider";
import { CredentialFormSchemaAll } from "../types";

type FormProps = {
  formSchemas: Array<CredentialFormSchema | CredentialFormSchemaAll>;
  isEditing: boolean;
  readonly?: boolean;
}

const Form = ({ formSchemas, isEditing, readonly }: FormProps) => {
  return (
    <div>
      hello
    </div>
  );
}

export default Form;