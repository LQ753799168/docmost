import { Group, Box, Button, TextInput, Stack, Textarea } from "@mantine/core";
import React from "react";
import { useForm, zodResolver } from "@mantine/form";
import * as z from "zod";
import { useUpdateSpaceMutation } from "@/features/space/queries/space-query.ts";
import { ISpace } from "@/features/space/types/space.types.ts";

const formSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().max(250),
});

type FormValues = z.infer<typeof formSchema>;
interface EditSpaceFormProps {
  space: ISpace;
}
export function EditSpaceForm({ space }: EditSpaceFormProps) {
  const updateSpaceMutation = useUpdateSpaceMutation();

  const form = useForm<FormValues>({
    validate: zodResolver(formSchema),
    initialValues: {
      name: space?.name,
      description: space?.description || "",
    },
  });

  const handleSubmit = async (values: {
    name?: string;
    description?: string;
  }) => {
    const spaceData: Partial<ISpace> = {
      spaceId: space.id,
    };
    if (form.isDirty("name")) {
      spaceData.name = values.name;
    }
    if (form.isDirty("description")) {
      spaceData.description = values.description;
    }

    await updateSpaceMutation.mutateAsync(spaceData);
    form.resetDirty();
  };

  return (
    <>
      <Box>
        <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
          <Stack>
            <TextInput
              id="name"
              label="Name"
              placeholder="e.g Developers"
              {...form.getInputProps("name")}
            />

            <Textarea
              id="description"
              label="Description"
              placeholder="e.g Space for developers to collaborate"
              autosize
              minRows={1}
              maxRows={3}
              {...form.getInputProps("description")}
            />
          </Stack>

          <Group justify="flex-end" mt="md">
            <Button type="submit" disabled={!form.isDirty()}>
              Save
            </Button>
          </Group>
        </form>
      </Box>
    </>
  );
}