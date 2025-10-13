package KnativeLogic

import (
	"context"
	"fmt"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	servingKnative "knative.dev/serving/pkg/apis/serving/v1"
	clienKnative "knative.dev/serving/pkg/client/clientset/versioned"
)

func CreateKnativeServises(image string, connectState *clienKnative.Clientset) {
	service := servingKnative.Service{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "knative-serving",
			Namespace: "default",
		},
		Spec: servingKnative.ServiceSpec{
			ConfigurationSpec: servingKnative.ConfigurationSpec{
				Template: servingKnative.RevisionTemplateSpec{
					Spec: servingKnative.RevisionSpec{
						PodSpec: corev1.PodSpec{
							Containers: []corev1.Container{
								{
									Image: image,
									Env: []corev1.EnvVar{
										{
											Name:  "TARGET",
											Value: "Go Sample v1",
										},
									},
								},
							},
						},
					},
				},
			},
		},
	}

	_, err := connectState.ServingV1().Services(service.Namespace).Create(context.Background(), &service, metav1.CreateOptions{})
	if err != nil {
		fmt.Println(err)
		return
	}
}
