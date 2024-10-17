import { NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import { useMemo } from "react";
import clsx from "clsx";
import { ActionIcon, AspectRatio, Button, Card, FocusTrap, Group, Popover, Text, TextInput } from "@mantine/core";
import { IconEdit } from "@tabler/icons-react";
import { z } from "zod";
import { useForm, zodResolver } from "@mantine/form";
import {
  getEmbedProviderByName,
  getEmbedUrlAndProvider
} from "@/features/editor/components/embed/providers.ts";
import { capitalizeFirstChar } from "@/lib";
import { notifications } from '@mantine/notifications';

const schema = z.object({
  url: z
    .string().trim().url({ message: 'please enter a valid url' }),
});

export default function EmbedView(props: NodeViewProps) {
  const { node, selected, updateAttributes } = props;
  const { src, provider } = node.attrs;

  const embedUrl = useMemo(() => {
    if (src) {
      console.log('yrl', src);
      return getEmbedUrlAndProvider(src).embedUrl;
    }
    return null;
  }, [src]);

  const embedForm = useForm<{ url: string }>({
    initialValues: {
      url: "",
    },
    validate: zodResolver(schema),
  });

  async function onSubmit(data: { url: string }) {
    if (provider) {
      const embedProvider = getEmbedProviderByName(provider);
      if (embedProvider.regex.test(data.url)) {
        updateAttributes({ src: data.url });
      } else {
        notifications.show({
          message: `Invalid ${provider} embed link`,
          position: 'top-right',
          color: 'red'
        });
      }
    }
  }

  return (
    <NodeViewWrapper>
      {embedUrl ? (
        <>
          <AspectRatio ratio={16 / 9}>
            <iframe
              src={embedUrl}
              allowFullScreen
              allow="encrypted-media"
            ></iframe>
          </AspectRatio>

        </>
      ) : (
        <Popover width={300} position="bottom" withArrow shadow="md">
          <Popover.Target>
            <Card
              radius="md"
              p="xs"
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              withBorder
              className={clsx(selected ? 'ProseMirror-selectednode' : '')}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <ActionIcon variant="transparent" color="gray">
                  <IconEdit size={18} />
                </ActionIcon>

                <Text component="span" size="lg" c="dimmed">
                  Embed {capitalizeFirstChar(provider)}
                </Text>
              </div>
            </Card>
          </Popover.Target>
          <Popover.Dropdown bg="var(--mantine-color-body)">
            <form onSubmit={embedForm.onSubmit(onSubmit)}>
              <FocusTrap active={true}>
                <TextInput placeholder={`Enter ${capitalizeFirstChar(provider)} link to embed`}
                           key={embedForm.key('url')}
                           {... embedForm.getInputProps('url')}
                           data-autofocus
                />
              </FocusTrap>

              <Group justify="center" mt="xs">
                <Button type="submit">Embed link</Button>
              </Group>
            </form>
          </Popover.Dropdown>
        </Popover>
      )}
    </NodeViewWrapper>
  );
}