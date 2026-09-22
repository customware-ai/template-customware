"use client";

/**
 * TEMPLATE EXAMPLE ONLY. Use this file to learn the shipped UI patterns, then
 * remove it with the demo surface when the real product UI replaces it.
 */
import { FileTextIcon, UserRoundIcon, XIcon } from "lucide-react";
import type { FormEvent, ReactElement } from "react";

import { ShowcaseCard, Section } from "~/components/demo/shared";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "~/components/ui/attachment";
import { Bubble, BubbleContent, BubbleReactions } from "~/components/ui/bubble";
import { Card, CardContent } from "~/components/ui/card";
import { Marker, MarkerContent } from "~/components/ui/marker";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from "~/components/ui/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "~/components/ui/message-scroller";
import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoiceDescription,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "~/components/ui/questionnaire";
import { toast } from "~/components/ui/toast";

const questionnaireItems = [
  {
    choices: [{ value: "brief" }, { value: "detailed" }],
    name: "format",
    required: true,
  },
  { name: "context", required: true },
] as const;

export function CommunicationSection(): ReactElement {
  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    toast.add({
      title: "Questionnaire submitted",
      description: "The communication preferences were captured.",
      type: "success",
    });
  };

  return (
    <Section
      title="Communication"
      description="Messages, attachments, transcript scrolling, and guided questions."
    >
      <div className="grid gap-8 xl:grid-cols-2">
        <ShowcaseCard
          title="Messages and attachments"
          description="Composable chat content with a bounded transcript."
        >
          <Card className="h-80">
            <CardContent className="min-h-0 flex-1 overflow-hidden">
              <MessageScrollerProvider>
                <MessageScroller>
                  <MessageScrollerViewport aria-label="Example conversation">
                    <MessageScrollerContent className="p-1">
                      <MessageScrollerItem messageId="assistant-intro">
                        <Message>
                          <MessageAvatar aria-label="Assistant">
                            <UserRoundIcon className="size-4" />
                          </MessageAvatar>
                          <MessageContent>
                            <MessageHeader>Template assistant</MessageHeader>
                            <Bubble variant="muted">
                              <BubbleContent>
                                The Base UI communication components are ready to compose.
                              </BubbleContent>
                              <BubbleReactions aria-label="One positive reaction">
                                +1
                              </BubbleReactions>
                            </Bubble>
                            <MessageFooter>Just now</MessageFooter>
                          </MessageContent>
                        </Message>
                      </MessageScrollerItem>
                      <MessageScrollerItem messageId="user-reply" scrollAnchor>
                        <Message align="end">
                          <MessageContent>
                            <Bubble>
                              <BubbleContent>Include the component inventory.</BubbleContent>
                            </Bubble>
                            <Attachment className="w-full max-w-72">
                              <AttachmentMedia>
                                <FileTextIcon />
                              </AttachmentMedia>
                              <AttachmentContent>
                                <AttachmentTitle>component-inventory.txt</AttachmentTitle>
                                <AttachmentDescription>Text · 4 KB</AttachmentDescription>
                              </AttachmentContent>
                              <AttachmentActions>
                                <AttachmentAction size="icon" aria-label="Remove attachment">
                                  <XIcon />
                                </AttachmentAction>
                              </AttachmentActions>
                            </Attachment>
                          </MessageContent>
                        </Message>
                      </MessageScrollerItem>
                      <MessageScrollerItem messageId="status">
                        <Marker variant="separator">
                          <MarkerContent>All components loaded</MarkerContent>
                        </Marker>
                      </MessageScrollerItem>
                    </MessageScrollerContent>
                  </MessageScrollerViewport>
                  <MessageScrollerButton />
                </MessageScroller>
              </MessageScrollerProvider>
            </CardContent>
          </Card>
        </ShowcaseCard>

        <ShowcaseCard
          title="Questionnaire"
          description="Keyboard-friendly, multi-step structured input."
        >
          <Card>
            <CardContent>
              <Questionnaire
                defaultItem="format"
                items={questionnaireItems}
                shortcuts="letters"
                onSubmit={handleSubmit}
              >
                <QuestionnaireProgress />
                <QuestionnaireItem name="format" required>
                  <QuestionnaireTitle>How should updates be written?</QuestionnaireTitle>
                  <QuestionnaireDescription>
                    Choose the preferred level of detail.
                  </QuestionnaireDescription>
                  <QuestionnaireChoices>
                    <QuestionnaireChoice value="brief">
                      Brief
                      <QuestionnaireChoiceDescription>
                        Only the result and next action
                      </QuestionnaireChoiceDescription>
                    </QuestionnaireChoice>
                    <QuestionnaireChoice value="detailed">
                      Detailed
                      <QuestionnaireChoiceDescription>
                        Include decisions and verification
                      </QuestionnaireChoiceDescription>
                    </QuestionnaireChoice>
                  </QuestionnaireChoices>
                  <QuestionnaireError />
                </QuestionnaireItem>
                <QuestionnaireItem name="context" required>
                  <QuestionnaireTitle>What context should be preserved?</QuestionnaireTitle>
                  <QuestionnaireInput aria-label="Context to preserve" placeholder="Add context" />
                  <QuestionnaireError />
                </QuestionnaireItem>
                <QuestionnaireActions>
                  <QuestionnairePrevious />
                  <QuestionnaireSkip />
                  <QuestionnaireNext />
                  <QuestionnaireSubmit />
                </QuestionnaireActions>
              </Questionnaire>
            </CardContent>
          </Card>
        </ShowcaseCard>
      </div>
    </Section>
  );
}
